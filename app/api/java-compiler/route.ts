import { constants as fsConstants } from "fs"
import { spawn } from "child_process"
import { access, copyFile, mkdir, mkdtemp, readdir, rm, writeFile } from "fs/promises"
import os from "os"
import path from "path"
import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

const MAX_FILES = 8
const MAX_FILE_SIZE = 20_000
const MAX_TOTAL_SIZE = 100_000
const MAX_OUTPUT_CHARS = 40_000
const JOOSC_TIMEOUT_MS = 6_000
const ASSEMBLE_TIMEOUT_MS = 6_000
const LINK_TIMEOUT_MS = 6_000
const RUN_TIMEOUT_MS = 3_000
const JAVA_FILE_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*\.java$/
const PACKAGE_PATTERN = /(^|\s)package\s+[A-Za-z_][A-Za-z0-9_.]*\s*;/
const OUTPUT_DIRECTORY = "output"
const EXECUTABLE_NAME = "main"

type BuildStage = "validation" | "compile" | "assemble" | "link" | "run"

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

const combineOutput = (stdout: string, stderr: string) =>
  [normalizeOutput(stdout), normalizeOutput(stderr)].filter(Boolean).join("\n")

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
  programOutput: string,
  error?: string,
) =>
  NextResponse.json({
    success,
    stage,
    compilerLog,
    programOutput,
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
      javaFiles.push(nextRelativePath)
    }
  }

  return javaFiles.sort()
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
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env,
      stdio: ["ignore", "pipe", "pipe"],
    })

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

    child.on("error", (error) => {
      finish({
        stdout,
        stderr,
        exitCode: null,
        timedOut: false,
        outputLimitExceeded: false,
        spawnError: `Failed to start ${path.basename(command)}: ${error.message}`,
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
    const nasmPath = path.join(process.cwd(), "bin", "nasm")
    const ldPath = path.join(process.cwd(), "bin", "ld")
    const stdlibSourceDir = path.join(process.cwd(), "bin", "stdlib")
    const runtimeSourcePath = path.join(process.cwd(), "bin", "stdlib", "runtime.s")

    await ensureExecutableFile(jooscPath, "joosc compiler")
    await ensureExecutableFile(nasmPath, "nasm assembler")
    await ensureExecutableFile(ldPath, "ld linker")
    await ensureReadableFile(runtimeSourcePath, "Runtime assembly")

    workspaceDir = await mkdtemp(path.join(os.tmpdir(), "joosc-sandbox-"))

    await Promise.all(files.map((file) => writeFile(path.join(workspaceDir!, file.name), file.content, "utf8")))

    const workspaceStdlibDir = path.join(workspaceDir, "stdlib")
    await copyDirectoryRecursive(stdlibSourceDir, workspaceStdlibDir)

    const stdlibJavaFiles = await findJavaFilesRecursive(workspaceDir, "stdlib")

    const env = sanitizeEnvironment(workspaceDir)
    const compilerLogSections: string[] = []

    const jooscArgs = [...files.map((file) => file.name), ...stdlibJavaFiles]
    const compileResult = await runProcess(jooscPath, jooscArgs, {
      cwd: workspaceDir,
      env,
      timeoutMs: JOOSC_TIMEOUT_MS,
    })

    compilerLogSections.push(formatProcessLog("compile", jooscPath, jooscArgs, compileResult))

    const compilerLog = () => compilerLogSections.filter(Boolean).join("\n\n")

    if (compileResult.spawnError) {
      return buildUserResponse(false, "compile", compilerLog(), "", compileResult.spawnError)
    }

    if (compileResult.timedOut) {
      return buildUserResponse(
        false,
        "compile",
        compilerLog(),
        "",
        `joosc timed out after ${JOOSC_TIMEOUT_MS / 1000} seconds.`,
      )
    }

    if (compileResult.outputLimitExceeded) {
      return buildUserResponse(false, "compile", compilerLog(), "", "joosc produced too much output for the sandbox.")
    }

    if (compileResult.exitCode !== 0) {
      return buildUserResponse(false, "compile", compilerLog(), "", "joosc compilation failed.")
    }

    const assemblyOutputDir = path.join(workspaceDir, OUTPUT_DIRECTORY)
    let assemblyFiles: string[]

    try {
      assemblyFiles = (await readdir(assemblyOutputDir))
        .filter((fileName) => fileName.endsWith(".s"))
        .sort()
        .map((fileName) => path.join(OUTPUT_DIRECTORY, fileName))
    } catch {
      return buildUserResponse(
        false,
        "compile",
        compilerLog(),
        "",
        "joosc completed without creating the expected output directory.",
      )
    }

    if (assemblyFiles.length === 0) {
      return buildUserResponse(
        false,
        "compile",
        compilerLog(),
        "",
        "joosc completed without generating any output/*.s files.",
      )
    }

    const nasmArgsPrefix = ["-O1", "-f", "elf", "-g", "-F", "dwarf"]

    for (const assemblyFile of assemblyFiles) {
      const assembleResult = await runProcess(nasmPath, [...nasmArgsPrefix, assemblyFile], {
        cwd: workspaceDir,
        env,
        timeoutMs: ASSEMBLE_TIMEOUT_MS,
      })

      compilerLogSections.push(
        formatProcessLog("assemble", nasmPath, [...nasmArgsPrefix, assemblyFile], assembleResult),
      )

      if (assembleResult.spawnError) {
        return buildUserResponse(false, "assemble", compilerLog(), "", assembleResult.spawnError)
      }

      if (assembleResult.timedOut) {
        return buildUserResponse(
          false,
          "assemble",
          compilerLog(),
          "",
          `Assembler timed out on ${assemblyFile} after ${ASSEMBLE_TIMEOUT_MS / 1000} seconds.`,
        )
      }

      if (assembleResult.outputLimitExceeded) {
        return buildUserResponse(false, "assemble", compilerLog(), "", "Assembler output exceeded the sandbox limit.")
      }

      if (assembleResult.exitCode !== 0) {
        return buildUserResponse(false, "assemble", compilerLog(), "", `Assembler failed for ${assemblyFile}.`)
      }
    }

    const runtimeAssemblyFile = path.join("stdlib", "runtime.s")
    const runtimeAssembleResult = await runProcess(nasmPath, [...nasmArgsPrefix, runtimeAssemblyFile], {
      cwd: workspaceDir,
      env,
      timeoutMs: ASSEMBLE_TIMEOUT_MS,
    })

    compilerLogSections.push(
      formatProcessLog("assemble", nasmPath, [...nasmArgsPrefix, runtimeAssemblyFile], runtimeAssembleResult),
    )

    if (runtimeAssembleResult.spawnError) {
      return buildUserResponse(false, "assemble", compilerLog(), "", runtimeAssembleResult.spawnError)
    }

    if (runtimeAssembleResult.timedOut) {
      return buildUserResponse(
        false,
        "assemble",
        compilerLog(),
        "",
        `Assembler timed out on ${runtimeAssemblyFile} after ${ASSEMBLE_TIMEOUT_MS / 1000} seconds.`,
      )
    }

    if (runtimeAssembleResult.outputLimitExceeded) {
      return buildUserResponse(false, "assemble", compilerLog(), "", "Assembler output exceeded the sandbox limit.")
    }

    if (runtimeAssembleResult.exitCode !== 0) {
      return buildUserResponse(false, "assemble", compilerLog(), "", "Assembler failed for stdlib/runtime.s.")
    }

    const objectFiles = assemblyFiles.map((assemblyFile) => assemblyFile.replace(/\.s$/i, ".o"))
    const linkArgs = ["-melf_i386", "-o", EXECUTABLE_NAME, ...objectFiles, path.join("stdlib", "runtime.o")]
    const linkResult = await runProcess(ldPath, linkArgs, {
      cwd: workspaceDir,
      env,
      timeoutMs: LINK_TIMEOUT_MS,
    })

    compilerLogSections.push(formatProcessLog("link", ldPath, linkArgs, linkResult))

    if (linkResult.spawnError) {
      return buildUserResponse(false, "link", compilerLog(), "", linkResult.spawnError)
    }

    if (linkResult.timedOut) {
      return buildUserResponse(false, "link", compilerLog(), "", `Linker timed out after ${LINK_TIMEOUT_MS / 1000} seconds.`)
    }

    if (linkResult.outputLimitExceeded) {
      return buildUserResponse(false, "link", compilerLog(), "", "Linker output exceeded the sandbox limit.")
    }

    if (linkResult.exitCode !== 0) {
      return buildUserResponse(false, "link", compilerLog(), "", "Linker failed.")
    }

    const executablePath = path.join(workspaceDir, EXECUTABLE_NAME)
    const runResult = await runProcess(executablePath, [], {
      cwd: workspaceDir,
      env,
      timeoutMs: RUN_TIMEOUT_MS,
    })

    if (runResult.spawnError) {
      return buildUserResponse(false, "run", compilerLog(), "", runResult.spawnError)
    }

    if (runResult.timedOut) {
      return buildUserResponse(
        false,
        "run",
        compilerLog(),
        combineOutput(runResult.stdout, runResult.stderr) || "Program execution timed out.",
        `Program execution timed out after ${RUN_TIMEOUT_MS / 1000} seconds.`,
      )
    }

    if (runResult.outputLimitExceeded) {
      return buildUserResponse(
        false,
        "run",
        compilerLog(),
        combineOutput(runResult.stdout, runResult.stderr) || "Program output exceeded the sandbox limit.",
        "Program output exceeded the sandbox limit.",
      )
    }

    if (runResult.exitCode !== 0) {
      return buildUserResponse(
        false,
        "run",
        compilerLog(),
        combineOutput(runResult.stdout, runResult.stderr) || "Program exited with an error.",
        "Program exited with an error.",
      )
    }

    return buildUserResponse(
      true,
      "run",
      compilerLog() || "Build successful.",
      combineOutput(runResult.stdout, runResult.stderr) || "Program exited without output.",
    )
  } catch (error) {
    if (error instanceof ValidationError) {
      return buildUserResponse(false, "validation", error.message, "", error.message)
    }

    console.error("joosc compiler API error:", error)
    return NextResponse.json(
      {
        success: false,
        stage: "run",
        compilerLog: "",
        programOutput: "",
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
