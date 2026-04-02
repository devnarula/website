import { constants as fsConstants } from "fs"
import { spawn } from "child_process"
import { access, copyFile, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "fs/promises"
import os from "os"
import path from "path"
import { type NextRequest, NextResponse } from "next/server"
import type { JavaCompilerAssemblyFile } from "@/lib/java-compiler-storage"

export const runtime = "nodejs"

const MAX_FILES = 8
const MAX_FILE_SIZE = 20_000
const MAX_TOTAL_SIZE = 100_000
const MAX_OUTPUT_CHARS = 40_000
const MAX_ASSEMBLY_TOTAL_SIZE = 300_000
const JOOSC_TIMEOUT_MS = 6_000
const JAVA_FILE_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*\.java$/
const PACKAGE_PATTERN = /(^|\s)package\s+[A-Za-z_][A-Za-z0-9_.]*\s*;/
const OUTPUT_DIRECTORY = "output"

type BuildStage = "validation" | "compile"

interface SourceFile {
  name: string
  content: string
}

interface CompilerRequest {
  files: SourceFile[]
}

interface ProcessResult {
  stdout: string
  stderr: string
  exitCode: number | null
  timedOut: boolean
  outputLimitExceeded: boolean
  spawnError?: string
}

class ValidationError extends Error {}

const normalizeOutput = (value: string) => value.replace(/\r\n?/g, "\n").trim()

const formatCommand = (command: string, args: string[]) => `$ ${[command, ...args].join(" ")}`

const formatProcessLog = (label: string, command: string, args: string[], result: ProcessResult) =>
  [
    `[${label}] ${formatCommand(command, args)}`,
    normalizeOutput(result.stdout),
    normalizeOutput(result.stderr),
    result.spawnError,
  ]
    .filter(Boolean)
    .join("\n")

const buildUserResponse = (
  success: boolean,
  stage: BuildStage,
  compilerLog: string,
  assemblyFiles: JavaCompilerAssemblyFile[],
  error?: string,
) =>
  NextResponse.json({
    success,
    stage,
    compilerLog,
    assemblyFiles,
    error,
  })

function sanitizeEnvironment(workspaceDir: string): NodeJS.ProcessEnv {
  return {
    PATH: process.env.PATH,
    HOME: workspaceDir,
    TMPDIR: workspaceDir,
    LANG: "C.UTF-8",
    LC_ALL: "C.UTF-8",
    NODE_ENV: process.env.NODE_ENV ?? "production",
  }
}

function validateRequest(body: CompilerRequest): SourceFile[] {
  if (!body || !Array.isArray(body.files) || body.files.length === 0) {
    throw new ValidationError("Add at least one Java source file before compiling.")
  }

  if (body.files.length > MAX_FILES) {
    throw new ValidationError(`This sandbox supports at most ${MAX_FILES} source files.`)
  }

  const seenNames = new Set<string>()
  let totalSize = 0

  const files = body.files.map((file, index) => {
    if (!file || typeof file.name !== "string" || typeof file.content !== "string") {
      throw new ValidationError(`File ${index + 1} is malformed.`)
    }

    const name = file.name.trim()
    const content = file.content.replace(/\r\n?/g, "\n")

    if (!JAVA_FILE_NAME_PATTERN.test(name)) {
      throw new ValidationError("File names must look like MyClass.java.")
    }

    const canonicalName = name.toLowerCase()
    if (seenNames.has(canonicalName)) {
      throw new ValidationError(`Duplicate file name detected: ${name}.`)
    }
    seenNames.add(canonicalName)

    if (content.length > MAX_FILE_SIZE) {
      throw new ValidationError(`${name} is too large for the sandbox.`)
    }

    if (PACKAGE_PATTERN.test(content)) {
      throw new ValidationError(`${name} declares a package. Only the default package is supported.`)
    }

    totalSize += content.length

    return { name, content }
  })

  if (totalSize > MAX_TOTAL_SIZE) {
    throw new ValidationError("The combined source size is too large for the sandbox.")
  }

  return files
}

async function ensureReadableFile(filePath: string, label: string) {
  try {
    await access(filePath, fsConstants.R_OK)
  } catch {
    throw new ValidationError(`${label} is missing at ${filePath}.`)
  }
}

async function ensureExecutableFile(filePath: string, label: string) {
  try {
    await access(filePath, fsConstants.X_OK)
  } catch {
    throw new ValidationError(`${label} is missing or not executable at ${filePath}.`)
  }
}

async function copyDirectoryRecursive(sourceDir: string, destinationDir: string): Promise<void> {
  await mkdir(destinationDir, { recursive: true })

  const entries = await readdir(sourceDir, { withFileTypes: true })

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name)
    const destinationPath = path.join(destinationDir, entry.name)

    if (entry.isDirectory()) {
      await copyDirectoryRecursive(sourcePath, destinationPath)
      continue
    }

    if (entry.isFile()) {
      await copyFile(sourcePath, destinationPath)
    }
  }
}

async function findJavaFilesRecursive(rootDir: string, relativeDir = ""): Promise<string[]> {
  const currentDirectory = path.join(rootDir, relativeDir)
  const entries = await readdir(currentDirectory, { withFileTypes: true })
  const javaFiles: string[] = []

  for (const entry of entries) {
    const nextRelativePath = path.join(relativeDir, entry.name)

    if (entry.isDirectory()) {
      javaFiles.push(...(await findJavaFilesRecursive(rootDir, nextRelativePath)))
      continue
    }

    if (entry.isFile() && entry.name.endsWith(".java")) {
      javaFiles.push(nextRelativePath.split(path.sep).join("/"))
    }
  }

  return javaFiles.sort()
}

async function collectAssemblyFilesRecursive(
  rootDir: string,
  relativeDir = "",
): Promise<JavaCompilerAssemblyFile[]> {
  const currentDirectory = path.join(rootDir, relativeDir)
  const entries = await readdir(currentDirectory, { withFileTypes: true })
  const assemblyFiles: JavaCompilerAssemblyFile[] = []

  for (const entry of entries) {
    const nextRelativePath = path.join(relativeDir, entry.name)

    if (entry.isDirectory()) {
      assemblyFiles.push(...(await collectAssemblyFilesRecursive(rootDir, nextRelativePath)))
      continue
    }

    if (entry.isFile() && entry.name.endsWith(".s")) {
      const content = await readFile(path.join(rootDir, nextRelativePath), "utf8")
      assemblyFiles.push({
        path: nextRelativePath.split(path.sep).join("/"),
        content,
      })
    }
  }

  return assemblyFiles.sort((left, right) => left.path.localeCompare(right.path))
}

function describeSpawnError(command: string, error: Error & { code?: string; errno?: number }) {
  const prefix = `Failed to start ${path.basename(command)}`

  if (error.code === "ENOENT") {
    return `${prefix}: command not found or not bundled for this deployment.`
  }

  if (error.code === "ENOEXEC" || error.errno === -8) {
    return `${prefix}: incompatible executable format or runtime library mismatch.`
  }

  return `${prefix}: ${error.message}`
}

function runProcess(
  command: string,
  args: string[],
  options: {
    cwd: string
    env: NodeJS.ProcessEnv
    timeoutMs: number
  },
): Promise<ProcessResult> {
  return new Promise((resolve) => {
    let child

    try {
      child = spawn(command, args, {
        cwd: options.cwd,
        env: options.env,
        stdio: ["ignore", "pipe", "pipe"],
      })
    } catch (spawnError) {
      const error = spawnError as Error & { code?: string; errno?: number }
      resolve({
        stdout: "",
        stderr: "",
        exitCode: null,
        timedOut: false,
        outputLimitExceeded: false,
        spawnError: describeSpawnError(command, error),
      })
      return
    }

    let stdout = ""
    let stderr = ""
    let settled = false

    const finish = (result: ProcessResult) => {
      if (settled) {
        return
      }
      settled = true
      clearTimeout(timer)
      resolve(result)
    }

    const appendChunk = (target: "stdout" | "stderr", chunk: string) => {
      if (target === "stdout") {
        stdout += chunk
      } else {
        stderr += chunk
      }

      if (stdout.length + stderr.length > MAX_OUTPUT_CHARS) {
        child.kill("SIGKILL")
        finish({
          stdout,
          stderr,
          exitCode: null,
          timedOut: false,
          outputLimitExceeded: true,
        })
      }
    }

    child.stdout.on("data", (chunk) => appendChunk("stdout", chunk.toString("utf8")))
    child.stderr.on("data", (chunk) => appendChunk("stderr", chunk.toString("utf8")))

    child.on("error", (runtimeError: Error & { code?: string; errno?: number }) => {
      finish({
        stdout,
        stderr,
        exitCode: null,
        timedOut: false,
        outputLimitExceeded: false,
        spawnError: describeSpawnError(command, runtimeError),
      })
    })

    child.on("close", (exitCode) => {
      finish({
        stdout,
        stderr,
        exitCode,
        timedOut: false,
        outputLimitExceeded: false,
      })
    })

    const timer = setTimeout(() => {
      child.kill("SIGKILL")
      finish({
        stdout,
        stderr,
        exitCode: null,
        timedOut: true,
        outputLimitExceeded: false,
      })
    }, options.timeoutMs)
  })
}

export async function POST(request: NextRequest) {
  let workspaceDir: string | undefined

  try {
    const body = (await request.json()) as CompilerRequest
    const files = validateRequest(body)

    const jooscPath = path.join(process.cwd(), "bin", "joosc")
    const stdlibSourceDir = path.join(process.cwd(), "bin", "stdlib")
    const runtimeSourcePath = path.join(process.cwd(), "bin", "stdlib", "runtime.s")

    await ensureExecutableFile(jooscPath, "joosc compiler")
    await ensureReadableFile(runtimeSourcePath, "Runtime assembly")

    workspaceDir = await mkdtemp(path.join(os.tmpdir(), "joosc-sandbox-"))

    await Promise.all(files.map((file) => writeFile(path.join(workspaceDir!, file.name), file.content, "utf8")))

    const workspaceStdlibDir = path.join(workspaceDir, "stdlib")
    await copyDirectoryRecursive(stdlibSourceDir, workspaceStdlibDir)

    const stdlibJavaFiles = await findJavaFilesRecursive(workspaceDir, "stdlib")
    const env = sanitizeEnvironment(workspaceDir)

    const jooscArgs = [...files.map((file) => file.name), ...stdlibJavaFiles]
    const compileResult = await runProcess(jooscPath, jooscArgs, {
      cwd: workspaceDir,
      env,
      timeoutMs: JOOSC_TIMEOUT_MS,
    })

    const compilerLog = formatProcessLog("compile", jooscPath, jooscArgs, compileResult)

    if (compileResult.spawnError) {
      return buildUserResponse(false, "compile", compilerLog, [], compileResult.spawnError)
    }

    if (compileResult.timedOut) {
      return buildUserResponse(
        false,
        "compile",
        compilerLog,
        [],
        `joosc timed out after ${JOOSC_TIMEOUT_MS / 1000} seconds.`,
      )
    }

    if (compileResult.outputLimitExceeded) {
      return buildUserResponse(false, "compile", compilerLog, [], "joosc produced too much output for the sandbox.")
    }

    if (compileResult.exitCode !== 0) {
      return buildUserResponse(false, "compile", compilerLog, [], "joosc compilation failed.")
    }

    let assemblyFiles: JavaCompilerAssemblyFile[]

    try {
      assemblyFiles = await collectAssemblyFilesRecursive(workspaceDir, OUTPUT_DIRECTORY)
    } catch {
      return buildUserResponse(
        false,
        "compile",
        compilerLog,
        [],
        "joosc completed without creating the expected output directory.",
      )
    }

    if (assemblyFiles.length === 0) {
      return buildUserResponse(
        false,
        "compile",
        compilerLog,
        [],
        "joosc completed without generating any output/*.s files.",
      )
    }

    const totalAssemblySize = assemblyFiles.reduce((total, file) => total + file.content.length, 0)

    if (totalAssemblySize > MAX_ASSEMBLY_TOTAL_SIZE) {
      return buildUserResponse(
        false,
        "compile",
        compilerLog,
        [],
        "Generated assembly is too large to store in the browser session.",
      )
    }

    return buildUserResponse(true, "compile", compilerLog, assemblyFiles)
  } catch (error) {
    if (error instanceof ValidationError) {
      return buildUserResponse(false, "validation", error.message, [], error.message)
    }

    console.error("joosc compiler API error:", error)
    return NextResponse.json(
      {
        success: false,
        stage: "compile",
        compilerLog: "",
        assemblyFiles: [],
        error: "The compiler service is unavailable right now.",
      },
      { status: 500 },
    )
  } finally {
    if (workspaceDir) {
      await rm(workspaceDir, { recursive: true, force: true }).catch(() => undefined)
    }
  }
}
