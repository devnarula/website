"use client"

import { useState } from "react"
import {
  AlertCircle,
  CheckCircle2,
  FileCode2,
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

interface SourceFile {
  id: string
  name: string
  content: string
}

interface CompilerResponse {
  success: boolean
  stage: "validation" | "compile" | "assemble" | "link" | "run"
  error?: string
  compilerLog: string
  programOutput: string
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
  {
    id: "greeter",
    name: "Greeter.java",
    content: `public class Greeter {
    public Greeter() {}

    public static int f() {
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

export default function JavaCompilerSandbox() {
  const [files, setFiles] = useState<SourceFile[]>(() => createStarterFiles())
  const [activeFileId, setActiveFileId] = useState("main")
  const [newFileName, setNewFileName] = useState("Helper.java")
  const [isRunning, setIsRunning] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<CompilerResponse | null>(null)

  const activeFile = files.find((file) => file.id === activeFileId) ?? files[0]

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
    setResult(null)
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
    setResult(null)
  }

  const updateActiveFileContent = (content: string) => {
    setFiles((currentFiles) =>
      currentFiles.map((file) => (file.id === activeFile?.id ? { ...file, content } : file)),
    )
  }

  const handleReset = () => {
    setFiles(createStarterFiles())
    setActiveFileId("main")
    setNewFileName("Helper.java")
    setMessage("Workspace reset to the sample project.")
    setError(null)
    setResult(null)
  }

  const handleCompile = async () => {
    setIsRunning(true)
    setError(null)
    setMessage(null)
    setResult(null)

    try {
      const response = await fetch("/api/java-compiler", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          files: files.map(({ name, content }) => ({ name, content })),
        }),
      })

      const data = (await response.json()) as CompilerResponse

      if (!response.ok) {
        throw new Error(data.error || "The compiler service failed.")
      }

      setResult(data)

      if (data.success) {
        setMessage("Built and ran the joosc pipeline successfully.")
      } else {
        setError(data.error || `The ${data.stage} step failed.`)
      }
    } catch (compileError) {
      setError(compileError instanceof Error ? compileError.message : "The compiler service failed.")
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="space-y-6">
      {(error || message) && (
        <Alert variant={error ? "destructive" : "default"}>
          {error ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          <AlertTitle>{error ? "Sandbox issue" : "Workspace updated"}</AlertTitle>
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
                  Create up to {MAX_FILES} source files in a single isolated project.
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
                      <Badge variant="outline">output/*.s expected</Badge>
                    </div>
                  </div>

                  <div className="rounded-lg border bg-background px-3 py-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Pipeline</p>
                    <p className="mt-1 text-sm font-medium">joosc -&gt; nasm -&gt; ld -&gt; ./main</p>
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
                        Compile & Run
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
                  Write joosc-compatible Java source here, then build the entire workspace through the server-side toolchain.
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
            <CardDescription>joosc, assembler, linker, and sandbox diagnostics.</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="min-h-[240px] whitespace-pre-wrap break-words rounded-lg bg-slate-950 p-4 font-mono text-sm leading-6 text-slate-100">
              {result?.compilerLog ?? "Build the workspace to see joosc, nasm, and ld output here."}
            </pre>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Program Output</CardTitle>
            <CardDescription>Combined console output from the generated executable.</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="min-h-[240px] whitespace-pre-wrap break-words rounded-lg bg-slate-950 p-4 font-mono text-sm leading-6 text-slate-100">
              {result?.programOutput ?? "Program output appears here after a successful run."}
            </pre>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Sandbox limits</AlertTitle>
        <AlertDescription>
          Each run uses a temporary workspace, expects <code>bin/joosc</code> and
          <code>bin/stdlib/runtime.s</code>, automatically adds <code>bin/stdlib/**/*.java</code> to the
          <code>joosc</code> command, assembles <code>output/*.s</code>, caps output volume, and returns
          missing-tool startup failures directly in the build log.
        </AlertDescription>
      </Alert>
    </div>
  )
}
