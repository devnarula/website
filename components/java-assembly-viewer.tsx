"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Copy,
  FileCode2,
  Folder,
  FolderOpen,
} from "lucide-react"
import MonacoCodeSurface from "@/components/monaco-code-surface"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  JAVA_COMPILER_ASSEMBLY_STORAGE_KEY,
  type JavaCompilerAssemblyFile,
  type JavaCompilerAssemblySession,
  parseJavaCompilerAssemblySession,
} from "@/lib/java-compiler-storage"

interface TreeNode {
  name: string
  path: string
  kind: "directory" | "file"
  children: TreeNode[]
}

function buildFileTree(files: JavaCompilerAssemblyFile[]): TreeNode[] {
  const root: TreeNode = { name: "", path: "", kind: "directory", children: [] }

  for (const file of files) {
    const parts = file.path.split("/")
    let currentNode = root

    parts.forEach((part, index) => {
      const currentPath = parts.slice(0, index + 1).join("/")
      const isFile = index === parts.length - 1
      let nextNode = currentNode.children.find(
        (child) => child.name === part && child.kind === (isFile ? "file" : "directory"),
      )

      if (!nextNode) {
        nextNode = {
          name: part,
          path: currentPath,
          kind: isFile ? "file" : "directory",
          children: [],
        }
        currentNode.children.push(nextNode)
      }

      currentNode = nextNode
    })
  }

  const sortNodes = (nodes: TreeNode[]): TreeNode[] =>
    nodes
      .map((node) => ({
        ...node,
        children: sortNodes(node.children),
      }))
      .sort((left, right) => {
        if (left.kind !== right.kind) {
          return left.kind === "directory" ? -1 : 1
        }

        return left.name.localeCompare(right.name)
      })

  return sortNodes(root.children)
}

function collectDirectoryPaths(nodes: TreeNode[]): string[] {
  const paths: string[] = []

  for (const node of nodes) {
    if (node.kind === "directory") {
      paths.push(node.path)
      paths.push(...collectDirectoryPaths(node.children))
    }
  }

  return paths
}

function getLineCount(content: string) {
  return content.split("\n").length
}

export default function JavaAssemblyViewer() {
  const [sessionData, setSessionData] = useState<JavaCompilerAssemblySession | null>(null)
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())
  const [copiedPath, setCopiedPath] = useState<string | null>(null)

  useEffect(() => {
    const storedSession = parseJavaCompilerAssemblySession(
      window.sessionStorage.getItem(JAVA_COMPILER_ASSEMBLY_STORAGE_KEY),
    )

    setSessionData(storedSession)

    if (!storedSession || storedSession.assemblyFiles.length === 0) {
      return
    }

    const tree = buildFileTree(storedSession.assemblyFiles)
    setSelectedPath(storedSession.assemblyFiles[0].path)
    setExpandedPaths(new Set(collectDirectoryPaths(tree)))
  }, [])

  const fileTree = useMemo(() => buildFileTree(sessionData?.assemblyFiles ?? []), [sessionData])
  const selectedFile = sessionData?.assemblyFiles.find((file) => file.path === selectedPath) ?? null
  const selectedFileLineCount = selectedFile ? getLineCount(selectedFile.content) : 0

  const toggleDirectory = (directoryPath: string) => {
    setExpandedPaths((currentPaths) => {
      const nextPaths = new Set(currentPaths)

      if (nextPaths.has(directoryPath)) {
        nextPaths.delete(directoryPath)
      } else {
        nextPaths.add(directoryPath)
      }

      return nextPaths
    })
  }

  const copySelectedFile = async () => {
    if (!selectedFile) {
      return
    }

    try {
      await navigator.clipboard.writeText(selectedFile.content)
      setCopiedPath(selectedFile.path)
      setTimeout(() => setCopiedPath(null), 2000)
    } catch {
      setCopiedPath(null)
    }
  }

  const renderTreeNodes = (nodes: TreeNode[], depth = 0): ReactNode =>
    nodes.map((node) => {
      if (node.kind === "directory") {
        const isExpanded = expandedPaths.has(node.path)

        return (
          <div key={node.path}>
            <button
              type="button"
              onClick={() => toggleDirectory(node.path)}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-foreground transition hover:bg-muted"
              style={{ paddingLeft: `${depth * 16 + 12}px` }}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              {isExpanded ? (
                <FolderOpen className="h-4 w-4 text-amber-600" />
              ) : (
                <Folder className="h-4 w-4 text-amber-600" />
              )}
              <span className="truncate">{node.name}</span>
            </button>

            {isExpanded && <div>{renderTreeNodes(node.children, depth + 1)}</div>}
          </div>
        )
      }

      const isSelected = selectedPath === node.path

      return (
        <button
          key={node.path}
          type="button"
          onClick={() => setSelectedPath(node.path)}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
            isSelected
              ? "bg-primary/10 text-primary"
              : "text-foreground hover:bg-muted"
          }`}
          style={{ paddingLeft: `${depth * 16 + 32}px` }}
        >
          <FileCode2 className={`h-4 w-4 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
          <span className="truncate">{node.name}</span>
        </button>
      )
    })

  if (!sessionData || sessionData.assemblyFiles.length === 0) {
    return (
      <section className="overflow-hidden rounded-[24px] border bg-card text-card-foreground shadow-sm">
        <div className="border-b bg-muted/30 px-6 py-6">
          <h1 className="text-2xl font-semibold">Assembly Explorer</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Compile the workspace in this same tab first. The viewer reads the latest generated assembly snapshot from
            session storage.
          </p>
        </div>

        <div className="p-6">
          <Alert>
            <AlertTitle>No assembly snapshot available</AlertTitle>
            <AlertDescription className="space-y-4">
              <p>Run a compile from the editor, then reopen this view to browse the generated output tree.</p>
              <Button asChild className="rounded-xl">
                <Link href="/projects/java-compiler">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Compiler
                </Link>
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </section>
    )
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[24px] border bg-card text-card-foreground shadow-sm">
        <div className="border-b bg-muted/30 px-6 py-6">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-border bg-background text-muted-foreground" variant="outline">
                  Monaco viewer
                </Badge>
                <Badge className="border-border bg-background text-muted-foreground" variant="outline">
                  Read-only assembly
                </Badge>
                <Badge className="border-border bg-background text-muted-foreground" variant="outline">
                  Explorer tree
                </Badge>
              </div>
              <div>
                <h1 className="text-2xl font-semibold md:text-3xl">Assembly Explorer</h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
                  Inspect every generated <code>output/**/*.s</code> file from the latest joosc compile in this tab,
                  switch between files from the explorer, and copy any assembly buffer directly from Monaco.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl border bg-background px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Files</p>
                <p className="mt-2 text-2xl font-semibold">{sessionData.assemblyFiles.length}</p>
                <p className="text-xs text-muted-foreground">assembly outputs</p>
              </div>
              <div className="rounded-2xl border bg-background px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Generated</p>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <Clock3 className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(sessionData.generatedAt).toLocaleString()}</span>
                </div>
              </div>
              <Button
                asChild
                variant="outline"
                className="rounded-xl"
              >
                <Link href="/projects/java-compiler">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Compiler
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="border-b bg-muted/20 xl:border-b-0 xl:border-r">
            <div className="border-b px-5 py-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Explorer</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Generated assembly files from the latest compile are grouped exactly by their output paths.
              </p>
            </div>

            <div className="max-h-[720px] overflow-y-auto px-3 py-4">{renderTreeNodes(fileTree)}</div>
          </aside>

          <div className="min-w-0 bg-background">
            <div className="border-b px-5 py-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="border-border bg-background text-foreground" variant="outline">
                      {selectedFile?.path ?? "Select a file"}
                    </Badge>
                    <Badge className="border-border bg-background text-muted-foreground" variant="outline">
                      {selectedFileLineCount} lines
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Read-only Monaco surface for the selected assembly file.
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={copySelectedFile}
                  disabled={!selectedFile}
                  className="rounded-xl"
                >
                  {copiedPath === selectedFile?.path ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copiedPath === selectedFile?.path ? "Copied" : "Copy File"}
                </Button>
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
                      <p className="text-sm font-medium text-zinc-100">{selectedFile?.path ?? "No file selected"}</p>
                      <p className="text-xs text-zinc-400">Monaco assembly buffer with custom syntax colors.</p>
                    </div>
                  </div>
                  <p className="hidden text-xs uppercase tracking-[0.2em] text-zinc-500 md:block">Assembly</p>
                </div>

                <MonacoCodeSurface
                  path={selectedFile ? `assembly://${selectedFile.path}` : "assembly://empty.s"}
                  language="joosc-assembly"
                  value={selectedFile?.content ?? "Select a file from the explorer to inspect its assembly output."}
                  readOnly
                  height={720}
                  options={{
                    lineNumbersMinChars: 3,
                    overviewRulerBorder: false,
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

      <section className="overflow-hidden rounded-[24px] border bg-card text-card-foreground shadow-sm">
        <div className="border-b px-5 py-4">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Compiler log</p>
          <h2 className="mt-2 text-lg font-semibold">Latest joosc output</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This is the exact log stored alongside the assembly snapshot for the current tab session.
          </p>
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
                value={sessionData.compilerLog || "No compiler output was returned."}
                readOnly
                height={232}
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
    </div>
  )
}
