export interface JavaCompilerSourceFile {
  name: string
  content: string
}

export interface JavaCompilerAssemblyFile {
  path: string
  content: string
}

export interface JavaCompilerResponse {
  success: boolean
  stage: "validation" | "compile"
  error?: string
  compilerLog: string
  assemblyFiles: JavaCompilerAssemblyFile[]
}

export interface JavaCompilerDraft {
  files: JavaCompilerSourceFile[]
  activeFileName?: string
  savedAt: string
}

export interface JavaCompilerAssemblySession {
  sourceFiles: JavaCompilerSourceFile[]
  assemblyFiles: JavaCompilerAssemblyFile[]
  compilerLog: string
  generatedAt: string
}

export const JAVA_COMPILER_DRAFT_STORAGE_KEY = "java-compiler-draft"
export const JAVA_COMPILER_ASSEMBLY_STORAGE_KEY = "java-compiler-assembly"

function isSourceFile(value: unknown): value is JavaCompilerSourceFile {
  return Boolean(
    value &&
      typeof value === "object" &&
      typeof (value as JavaCompilerSourceFile).name === "string" &&
      typeof (value as JavaCompilerSourceFile).content === "string",
  )
}

function isAssemblyFile(value: unknown): value is JavaCompilerAssemblyFile {
  return Boolean(
    value &&
      typeof value === "object" &&
      typeof (value as JavaCompilerAssemblyFile).path === "string" &&
      typeof (value as JavaCompilerAssemblyFile).content === "string",
  )
}

export function parseJavaCompilerDraft(rawValue: string | null): JavaCompilerDraft | null {
  if (!rawValue) {
    return null
  }

  try {
    const value = JSON.parse(rawValue) as Partial<JavaCompilerDraft>

    if (!Array.isArray(value.files) || !value.files.every(isSourceFile) || typeof value.savedAt !== "string") {
      return null
    }

    if (value.activeFileName !== undefined && typeof value.activeFileName !== "string") {
      return null
    }

    return {
      files: value.files,
      activeFileName: value.activeFileName,
      savedAt: value.savedAt,
    }
  } catch {
    return null
  }
}

export function parseJavaCompilerAssemblySession(rawValue: string | null): JavaCompilerAssemblySession | null {
  if (!rawValue) {
    return null
  }

  try {
    const value = JSON.parse(rawValue) as Partial<JavaCompilerAssemblySession>

    if (
      !Array.isArray(value.sourceFiles) ||
      !value.sourceFiles.every(isSourceFile) ||
      !Array.isArray(value.assemblyFiles) ||
      !value.assemblyFiles.every(isAssemblyFile) ||
      typeof value.compilerLog !== "string" ||
      typeof value.generatedAt !== "string"
    ) {
      return null
    }

    return {
      sourceFiles: value.sourceFiles,
      assemblyFiles: value.assemblyFiles,
      compilerLog: value.compilerLog,
      generatedAt: value.generatedAt,
    }
  } catch {
    return null
  }
}
