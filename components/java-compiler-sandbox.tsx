"use client"

import { useEffect, useState } from "react"
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  }
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
        <Alert variant={error ? "destructive" : "default"}>
          {error ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          <AlertTitle>{error ? "Compiler issue" : "Workspace updated"}</AlertTitle>
          <AlertDescription>{error ?? message}</AlertDescription>
        </Alert>
      )}

      <Card className="overflow-hidden shadow-lg">
        <CardContent className="p-0">
          <div className="grid lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="border-b bg-muted/20 lg:border-b-0 lg:border-r">
              <div className="border-b px-4 py-4">
                <p className="text-sm font-semibold">Workspace Files</p>
                <p className="text-sm text-muted-foreground">
                  Create up to {MAX_FILES} source files. Drafts are saved in your browser automatically.
                </p>
              </div>

              <div className="space-y-2 p-4">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors",
                      file.id === activeFileId ? "border-primary bg-primary/5" : "border-transparent bg-background",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveFileId(file.id)}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                    >
                      <FileCode2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate text-sm font-medium">{file.name}</span>
                    </button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() => handleDeleteFile(file.id)}
                      disabled={isRunning}
                      aria-label={`Delete ${file.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="border-t px-4 py-4 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="new-file-name">New file</Label>
                  <Input
                    id="new-file-name"
                    placeholder="Helper.java"
                    value={newFileName}
                    onChange={(event) => setNewFileName(event.target.value)}
                    disabled={isRunning}
                  />
                </div>

                <Button type="button" variant="outline" className="w-full" onClick={handleCreateFile} disabled={isRunning}>
                  <Plus className="h-4 w-4" />
                  Add File
                </Button>
              </div>
            </aside>

            <section className="flex min-h-[640px] flex-col">
              <div className="border-b bg-muted/20 px-4 py-4">
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px_auto_auto] xl:items-end">
                  <div>
                    <p className="text-sm font-semibold">Editing</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{activeFile?.name ?? "No file selected"}</Badge>
                      <Badge variant="outline">Default package only</Badge>
                      <Badge variant="outline">Assembly output under output/</Badge>
                    </div>
                  </div>

                  <div className="rounded-lg border bg-background px-3 py-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Pipeline</p>
                    <p className="mt-1 text-sm font-medium">bin/joosc -&gt; output/**/*.s</p>
                  </div>

                  <Button type="button" className="w-full xl:w-auto" onClick={handleCompile} disabled={isRunning}>
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
                    className="w-full xl:w-auto"
                    onClick={handleReset}
                    disabled={isRunning}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset Sample
                  </Button>
                </div>
              </div>

              <div className="border-b px-4 py-3">
                <p className="text-sm font-semibold">{activeFile?.name ?? "Source file"}</p>
                <p className="text-sm text-muted-foreground">
                  Write joosc-compatible Java source here, compile it, then inspect the generated assembly in the viewer.
                </p>
              </div>

              <div className="flex-1 bg-slate-950">
                <Textarea
                  value={activeFile?.content ?? ""}
                  onChange={(event) => updateActiveFileContent(event.target.value)}
                  className="min-h-[460px] rounded-none border-0 bg-transparent px-4 py-4 font-mono text-[13px] leading-6 text-slate-100 shadow-none focus-visible:ring-0"
                  spellCheck={false}
                  disabled={isRunning || !activeFile}
                />
              </div>
            </section>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Build Log</CardTitle>
            <CardDescription>bin/joosc output and compile diagnostics.</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="min-h-[240px] whitespace-pre-wrap break-words rounded-lg bg-slate-950 p-4 font-mono text-sm leading-6 text-slate-100">
              {result?.compilerLog ?? "Compile the workspace to see joosc output here."}
            </pre>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Generated Assembly</CardTitle>
            <CardDescription>Open the explorer page to browse the latest generated assembly tree.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedAssemblyCount > 0 ? (
              <>
                <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/20 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold">{generatedAssemblyCount} file{generatedAssemblyCount === 1 ? "" : "s"} ready</p>
                    <p className="text-sm text-muted-foreground">
                      Stored in this tab's session for the assembly viewer.
                    </p>
                  </div>
                  <Button type="button" onClick={handleViewAssembly} disabled={!hasStoredAssembly}>
                    <FolderTree className="h-4 w-4" />
                    View Assembly
                  </Button>
                </div>

                <div className="space-y-2">
                  {result?.assemblyFiles.slice(0, 6).map((file) => (
                    <div
                      key={file.path}
                      className="rounded-md border px-3 py-2 font-mono text-sm text-muted-foreground"
                    >
                      {file.path}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
                Compile the workspace to generate `output/**/*.s` files and open them in the assembly viewer.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Browser persistence</AlertTitle>
        <AlertDescription>
          Java source files are stored in <code>localStorage</code> so drafts survive refreshes. The latest generated
          assembly tree is stored in <code>sessionStorage</code> for the dedicated viewer page in this tab.
        </AlertDescription>
      </Alert>
    </div>
  )
}
