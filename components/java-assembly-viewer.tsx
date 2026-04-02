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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
      let nextNode = currentNode.children.find((child) => child.name === part && child.kind === (isFile ? "file" : "directory"))

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
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
              style={{ paddingLeft: `${depth * 16 + 8}px` }}
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              {isExpanded ? <FolderOpen className="h-4 w-4 text-amber-500" /> : <Folder className="h-4 w-4 text-amber-500" />}
              <span className="truncate">{node.name}</span>
            </button>

            {isExpanded && <div>{renderTreeNodes(node.children, depth + 1)}</div>}
          </div>
        )
      }

      return (
        <button
          key={node.path}
          type="button"
          onClick={() => setSelectedPath(node.path)}
          className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm ${
            selectedPath === node.path ? "bg-primary/10 text-primary" : "hover:bg-accent"
          }`}
          style={{ paddingLeft: `${depth * 16 + 28}px` }}
        >
          <FileCode2 className="h-4 w-4 shrink-0" />
          <span className="truncate">{node.name}</span>
        </button>
      )
    })

  if (!sessionData || sessionData.assemblyFiles.length === 0) {
    return (
      <Alert>
        <AlertTitle>No Assembly Available</AlertTitle>
        <AlertDescription className="space-y-4">
          <p>Compile the current workspace first, then open the viewer in the same tab to inspect the generated assembly.</p>
          <Button asChild variant="outline">
            <Link href="/projects/java-compiler">
              <ArrowLeft className="h-4 w-4" />
              Back to Compiler
            </Link>
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{sessionData.assemblyFiles.length} assembly files</Badge>
            <Badge variant="secondary">{sessionData.sourceFiles.length} source files</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock3 className="h-4 w-4" />
            <span>Generated {new Date(sessionData.generatedAt).toLocaleString()}</span>
          </div>
        </div>

        <Button asChild variant="outline">
          <Link href="/projects/java-compiler">
            <ArrowLeft className="h-4 w-4" />
            Back to Compiler
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <CardTitle>Explorer</CardTitle>
            <CardDescription>Generated assembly files from the latest compile in this tab.</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[75vh] overflow-auto p-3">{renderTreeNodes(fileTree)}</CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="border-b">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="truncate">{selectedFile?.path ?? "Select a file"}</CardTitle>
                  <CardDescription>Read-only assembly output. Use the explorer to switch files.</CardDescription>
                </div>
                <Button type="button" variant="outline" onClick={copySelectedFile} disabled={!selectedFile}>
                  {copiedPath === selectedFile?.path ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copiedPath === selectedFile?.path ? "Copied" : "Copy File"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <pre className="h-[75vh] overflow-auto bg-slate-950 p-4 font-mono text-sm leading-6 text-slate-100">
                {selectedFile?.content ?? "Select a file from the explorer to view its contents."}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compiler Log</CardTitle>
              <CardDescription>Latest bin/joosc command output for this assembly snapshot.</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="max-h-[240px] overflow-auto whitespace-pre-wrap break-words rounded-lg bg-slate-950 p-4 font-mono text-sm leading-6 text-slate-100">
                {sessionData.compilerLog || "No compiler output was returned."}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
