"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  CheckCircle2,
  FileCode2,
  FolderTree,
  Loader2,
  Play,
  Plus,
  RotateCcw,
  Shield,
  Trash2,
} from "lucide-react"
import MonacoCodeSurface from "@/components/monaco-code-surface"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import {
  JAVA_COMPILER_ASSEMBLY_STORAGE_KEY,
  JAVA_COMPILER_DRAFT_STORAGE_KEY,
  type JavaCompilerAssemblySession,
  type JavaCompilerDraft,
  type JavaCompilerResponse,
  type JavaCompilerSourceFile,
  parseJavaCompilerAssemblySession,
  parseJavaCompilerDraft,
} from "@/lib/java-compiler-storage"

interface SourceFile extends JavaCompilerSourceFile {
  id: string
}

const MAX_FILES = 8
const JAVA_FILE_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*\.java$/

const createStarterFiles = (): SourceFile[] => [
  {
    id: "main",
    name: "Main.java",
    content: `public class Main {
    public Main() {}

    public static int test() {
        return 0;
    }
}

`,
  },
]

const createFileId = () => `file-${Math.random().toString(36).slice(2, 10)}`

const getClassName = (fileName: string) => fileName.replace(/\.java$/i, "")

const createFileTemplate = (fileName: string) => {
  const className = getClassName(fileName)
  return `class ${className} {

}
`
}

const toSourceFiles = (files: SourceFile[]): JavaCompilerSourceFile[] =>
  files.map(({ name, content }) => ({ name, content }))

const fromSourceFiles = (files: JavaCompilerSourceFile[]): SourceFile[] =>
  files.map((file) => ({
    id: createFileId(),
    name: file.name,
    content: file.content,
  }))

function clearAssemblySessionStorage() {
  try {
    window.sessionStorage.removeItem(JAVA_COMPILER_ASSEMBLY_STORAGE_KEY)
  } catch {
    // Ignore browser storage failures and keep the editor usable.
  }
}

function saveDraftToStorage(files: SourceFile[], activeFileId: string) {
  try {
    const activeFileName = files.find((file) => file.id === activeFileId)?.name ?? files[0]?.name
    const draft: JavaCompilerDraft = {
      files: toSourceFiles(files),
      activeFileName,
      savedAt: new Date().toISOString(),
    }
    window.localStorage.setItem(JAVA_COMPILER_DRAFT_STORAGE_KEY, JSON.stringify(draft))
  } catch {
    // Ignore browser storage failures and keep the editor usable.
  }
}

function saveAssemblySessionToStorage(files: SourceFile[], response: JavaCompilerResponse) {
  const session: JavaCompilerAssemblySession = {
    sourceFiles: toSourceFiles(files),
    assemblyFiles: response.assemblyFiles,
    compilerLog: response.compilerLog,
    generatedAt: new Date().toISOString(),
  }

  window.sessionStorage.setItem(JAVA_COMPILER_ASSEMBLY_STORAGE_KEY, JSON.stringify(session))
}

function getLineCount(content: string) {
  return content.split("\n").length
}

function formatAssemblyManifest(response: JavaCompilerResponse | null) {
  if (!response || response.assemblyFiles.length === 0) {
    return [
      "Compile the workspace to generate output/**/*.s files.",
      "",
      "The newest assembly snapshot will appear here and can be opened",
      "in the dedicated explorer page for full browsing and copying.",
    ].join("\n")
  }

  return response.assemblyFiles
    .map((file, index) => `${String(index + 1).padStart(2, "0")}. ${file.path}`)
    .join("\n")
}

export default function JavaCompilerSandbox() {
  const router = useRouter()
  const [files, setFiles] = useState<SourceFile[]>(() => createStarterFiles())
  const [activeFileId, setActiveFileId] = useState("main")
  const [newFileName, setNewFileName] = useState("Helper.java")
  const [isRunning, setIsRunning] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<JavaCompilerResponse | null>(null)
  const [isDraftLoaded, setIsDraftLoaded] = useState(false)
  const [hasStoredAssembly, setHasStoredAssembly] = useState(false)

  const activeFile = files.find((file) => file.id === activeFileId) ?? files[0]
  const activeFileLineCount = useMemo(() => getLineCount(activeFile?.content ?? ""), [activeFile?.content])
  const activeFileCharacterCount = activeFile?.content.length ?? 0
  const compilerLogValue = result?.compilerLog || "Compile the workspace to see bin/joosc diagnostics here."
  const assemblyManifestValue = useMemo(() => formatAssemblyManifest(result), [result])

  useEffect(() => {
    const draft = parseJavaCompilerDraft(window.localStorage.getItem(JAVA_COMPILER_DRAFT_STORAGE_KEY))
    const assemblySession = parseJavaCompilerAssemblySession(
      window.sessionStorage.getItem(JAVA_COMPILER_ASSEMBLY_STORAGE_KEY),
    )

    if (draft && draft.files.length > 0) {
      const restoredFiles = fromSourceFiles(draft.files)
      const restoredActiveFile =
        restoredFiles.find((file) => file.name === draft.activeFileName) ?? restoredFiles[0]

      setFiles(restoredFiles)
      setActiveFileId(restoredActiveFile.id)
    }

    setHasStoredAssembly(Boolean(assemblySession && assemblySession.assemblyFiles.length > 0))
    setIsDraftLoaded(true)
  }, [])

  useEffect(() => {
    if (!isDraftLoaded) {
      return
    }

    saveDraftToStorage(files, activeFileId)
  }, [activeFileId, files, isDraftLoaded])

  const invalidateCompiledAssembly = () => {
    setResult(null)
    setHasStoredAssembly(false)
    clearAssemblySessionStorage()
  }

  const handleCreateFile = () => {
    const trimmedName = newFileName.trim()

    if (!trimmedName) {
      setError("Enter a file name before adding a new source file.")
      return
    }

    if (!JAVA_FILE_NAME_PATTERN.test(trimmedName)) {
      setError("File names must look like MyClass.java and stay in the default package.")
      return
    }

    if (files.some((file) => file.name.toLowerCase() === trimmedName.toLowerCase())) {
      setError(`A file named ${trimmedName} already exists.`)
      return
    }

    if (files.length >= MAX_FILES) {
      setError(`This sandbox supports up to ${MAX_FILES} files per workspace.`)
      return
    }

    const nextFile = {
      id: createFileId(),
      name: trimmedName,
      content: createFileTemplate(trimmedName),
    }

    setFiles((currentFiles) => [...currentFiles, nextFile])
    setActiveFileId(nextFile.id)
    setNewFileName("")
    setMessage(`Added ${trimmedName}.`)
    setError(null)
    invalidateCompiledAssembly()
  }

  const handleDeleteFile = (fileId: string) => {
    if (files.length === 1) {
      setError("Keep at least one source file in the workspace.")
      return
    }

    const fileIndex = files.findIndex((file) => file.id === fileId)
    const fileToDelete = files[fileIndex]
    const nextFiles = files.filter((file) => file.id !== fileId)

    setFiles(nextFiles)

    if (fileId === activeFileId) {
      const fallbackIndex = Math.max(fileIndex - 1, 0)
      setActiveFileId(nextFiles[fallbackIndex]?.id ?? nextFiles[0].id)
    }

    if (fileToDelete) {
      setMessage(`Removed ${fileToDelete.name}.`)
    }

    setError(null)
    invalidateCompiledAssembly()
  }

  const updateActiveFileContent = (content: string) => {
    setFiles((currentFiles) =>
      currentFiles.map((file) => (file.id === activeFile?.id ? { ...file, content } : file)),
    )
    setError(null)
    invalidateCompiledAssembly()
  }

  const handleReset = () => {
    const starterFiles = createStarterFiles()
    setFiles(starterFiles)
    setActiveFileId(starterFiles[0].id)
    setNewFileName("Helper.java")
    setMessage("Workspace reset to the sample project.")
    setError(null)
    invalidateCompiledAssembly()
  }

  const handleCompile = async () => {
    setIsRunning(true)
    setError(null)
    setMessage(null)
    invalidateCompiledAssembly()

    try {
      const response = await fetch("/api/java-compiler", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          files: toSourceFiles(files),
        }),
      })

      const data = (await response.json()) as JavaCompilerResponse

      if (!response.ok) {
        throw new Error(data.error || "The compiler service failed.")
      }

      setResult(data)

      if (!data.success) {
        setError(data.error || `The ${data.stage} step failed.`)
        return
      }

      try {
        saveAssemblySessionToStorage(files, data)
        setHasStoredAssembly(true)
        setMessage(`Generated ${data.assemblyFiles.length} assembly file${data.assemblyFiles.length === 1 ? "" : "s"}.`)
      } catch {
        setHasStoredAssembly(false)
        setError("Compilation succeeded, but the browser could not store the generated assembly for viewing.")
      }
    } catch (compileError) {
      setError(compileError instanceof Error ? compileError.message : "The compiler service failed.")
    } finally {
      setIsRunning(false)
    }
  }

  const handleViewAssembly = () => {
    router.push("/projects/java-compiler/assembly")
  }

  const generatedAssemblyCount = result?.assemblyFiles.length ?? 0

  return (
    <div className="space-y-6">
      {(error || message) && (
        <Alert
          variant={error ? "destructive" : "default"}
          className={cn(
            "border shadow-sm",
            !error && "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-100",
          )}
        >
          {error ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          <AlertTitle>{error ? "Compiler issue" : "Workspace updated"}</AlertTitle>
          <AlertDescription>{error ?? message}</AlertDescription>
        </Alert>
      )}

      <section className="overflow-hidden rounded-[24px] border bg-card text-card-foreground shadow-sm">
        <div className="border-b bg-muted/30 px-6 py-6">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-border bg-background text-muted-foreground" variant="outline">
                  Monaco workspace
                </Badge>
                <Badge className="border-border bg-background text-muted-foreground" variant="outline">
                  joosc pipeline
                </Badge>
                <Badge className="border-border bg-background text-muted-foreground" variant="outline">
                  output/**/*.s
                </Badge>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Compiler Workspace</h2>
                <p className="max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
                  Write joosc-compatible Java in a multi-file workspace, compile it inside an isolated temp
                  environment, and move straight into the generated assembly explorer without leaving this flow.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border bg-background px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Files</p>
                <p className="mt-2 text-2xl font-semibold">{files.length}</p>
                <p className="text-xs text-muted-foreground">Up to {MAX_FILES} source files</p>
              </div>
              <div className="rounded-2xl border bg-background px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Selection</p>
                <p className="mt-2 text-lg font-semibold">{activeFileLineCount} lines</p>
                <p className="text-xs text-muted-foreground">{activeFileCharacterCount} characters</p>
              </div>
              <div className="rounded-2xl border bg-background px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Latest Build</p>
                <p className="mt-2 text-lg font-semibold">{generatedAssemblyCount}</p>
                <p className="text-xs text-muted-foreground">assembly files ready</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid xl:grid-cols-[290px_minmax(0,1fr)]">
          <aside className="border-b bg-muted/20 xl:border-b-0 xl:border-r">
            <div className="border-b px-5 py-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Workspace files</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Drafts are persisted in this browser. Click any file to swap Monaco models instantly.
              </p>
            </div>

            <div className="max-h-[420px] space-y-2 overflow-y-auto px-4 py-4">
              {files.map((file) => {
                const isActive = file.id === activeFileId

                return (
                  <div
                    key={file.id}
                    className={cn(
                      "group flex items-center gap-3 rounded-2xl border px-3 py-3 transition-all",
                      isActive
                        ? "border-primary/25 bg-primary/5"
                        : "bg-background hover:border-primary/20 hover:bg-muted/40",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveFileId(file.id)}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <span
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-xl border",
                          isActive
                            ? "border-primary/20 bg-primary/10 text-primary"
                            : "border-border bg-background text-muted-foreground",
                        )}
                      >
                        <FileCode2 className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{file.name}</span>
                        <span className="block text-xs text-muted-foreground">{getLineCount(file.content)} lines</span>
                      </span>
                    </button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
                      onClick={() => handleDeleteFile(file.id)}
                      disabled={isRunning}
                      aria-label={`Delete ${file.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
            </div>

            <div className="border-t px-5 py-5">
              <div className="space-y-2">
                <Label htmlFor="new-file-name" className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Add file
                </Label>
                <Input
                  id="new-file-name"
                  placeholder="Helper.java"
                  value={newFileName}
                  onChange={(event) => setNewFileName(event.target.value)}
                  disabled={isRunning}
                  className="h-11 rounded-xl"
                />
              </div>

              <Button
                type="button"
                variant="outline"
                className="mt-3 w-full rounded-xl"
                onClick={handleCreateFile}
                disabled={isRunning}
              >
                <Plus className="h-4 w-4" />
                Add Source File
              </Button>

              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                Use simple names like <code>Main.java</code>. All files stay in the default package for joosc.
              </p>
            </div>
          </aside>

          <div className="min-w-0 bg-background">
            <div className="border-b px-5 py-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="border-border bg-background text-foreground" variant="outline">
                      {activeFile?.name ?? "No file selected"}
                    </Badge>
                    <Badge className="border-border bg-background text-muted-foreground" variant="outline">
                      Default package
                    </Badge>
                    <Badge className="border-border bg-background text-muted-foreground" variant="outline">
                      bin/joosc
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                    <span>{activeFileLineCount} lines</span>
                    <span>{activeFileCharacterCount} characters</span>
                    <span>{files.length} files in workspace</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    className="rounded-xl px-4"
                    onClick={handleCompile}
                    disabled={isRunning}
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Compiling...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Compile to Assembly
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    onClick={handleReset}
                    disabled={isRunning}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset Sample
                  </Button>
                </div>
              </div>
            </div>

            <div className="px-4 py-4">
              <div className="overflow-hidden rounded-[20px] border border-zinc-800 bg-[#1E1E1E] shadow-sm">
                <div className="flex items-center justify-between border-b border-zinc-800 bg-[#252526] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-700/60 text-zinc-200">
                      <FileCode2 className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-zinc-100">{activeFile?.name ?? "Source file"}</p>
                      <p className="text-xs text-zinc-400">Monaco Java editor with per-file state retention.</p>
                    </div>
                  </div>
                  <p className="hidden text-xs uppercase tracking-[0.2em] text-zinc-500 md:block">Source</p>
                </div>

                <MonacoCodeSurface
                  path={activeFile?.name}
                  language="java"
                  value={activeFile?.content ?? ""}
                  onChange={updateActiveFileContent}
                  readOnly={isRunning || !activeFile}
                  height={640}
                  options={{
                    lineNumbersMinChars: 3,
                    overviewRulerBorder: false,
                    quickSuggestions: !isRunning,
                    scrollbar: {
                      horizontalScrollbarSize: 10,
                      verticalScrollbarSize: 10,
                    },
                    stickyScroll: {
                      enabled: false,
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="overflow-hidden rounded-[24px] border bg-card text-card-foreground shadow-sm">
          <div className="border-b px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Compiler log</p>
                <h3 className="mt-2 text-lg font-semibold">bin/joosc diagnostics</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Success and failure output from the latest compile request.
                </p>
              </div>
              <Badge className="border-border bg-background text-muted-foreground" variant="outline">
                {isRunning ? "running" : "idle"}
              </Badge>
            </div>
          </div>

          <div className="p-4">
            <div className="overflow-hidden rounded-[20px] border border-zinc-800 bg-[#1E1E1E] shadow-sm">
              <div className="border-b border-zinc-800 bg-[#252526] px-4 py-2 text-xs uppercase tracking-[0.2em] text-zinc-400">
                Console
              </div>
              <div className="bg-[#252526] p-3">
                <MonacoCodeSurface
                  className="monaco-content-inset overflow-hidden rounded-[14px] border border-zinc-700"
                  path="compiler-log.txt"
                  language="plaintext"
                  value={compilerLogValue}
                  readOnly
                  height={252}
                  options={{
                    folding: false,
                    lineNumbers: "off",
                    lineDecorationsWidth: 0,
                    renderLineHighlight: "none",
                    scrollbar: {
                      horizontalScrollbarSize: 10,
                      verticalScrollbarSize: 10,
                    },
                    wordWrap: "on",
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[24px] border bg-card text-card-foreground shadow-sm">
          <div className="border-b px-5 py-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Assembly snapshot</p>
                <h3 className="mt-2 text-lg font-semibold">Generated file manifest</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  The latest assembly tree is cached in this tab and opens in a dedicated explorer page.
                </p>
              </div>
              <Button
                type="button"
                onClick={handleViewAssembly}
                disabled={!hasStoredAssembly}
                className="rounded-xl px-4"
              >
                <FolderTree className="h-4 w-4" />
                View Assembly
              </Button>
            </div>
          </div>

          <div className="p-4">
            <div className="overflow-hidden rounded-[20px] border border-zinc-800 bg-[#1E1E1E] shadow-sm">
              <div className="border-b border-zinc-800 bg-[#252526] px-4 py-2 text-xs uppercase tracking-[0.2em] text-zinc-400">
                Output files
              </div>
              <div className="bg-[#252526] p-3">
                <MonacoCodeSurface
                  className="monaco-content-inset overflow-hidden rounded-[14px] border border-zinc-700"
                  path="assembly-manifest.txt"
                  language="plaintext"
                  value={assemblyManifestValue}
                  readOnly
                  height={252}
                  options={{
                    folding: false,
                    lineNumbers: "off",
                    lineDecorationsWidth: 0,
                    renderLineHighlight: "none",
                    scrollbar: {
                      horizontalScrollbarSize: 10,
                      verticalScrollbarSize: 10,
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      <Alert className="border-slate-200 bg-slate-50/80 text-slate-900 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-100">
        <Shield className="h-4 w-4" />
        <AlertTitle>Browser persistence</AlertTitle>
        <AlertDescription>
          Source drafts live in <code>localStorage</code> so they survive refreshes. The most recent generated
          assembly tree is cached in <code>sessionStorage</code> for the dedicated viewer route in this tab.
        </AlertDescription>
      </Alert>
    </div>
  )
}
