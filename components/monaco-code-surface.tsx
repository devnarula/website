"use client"

import Editor, { type Monaco } from "@monaco-editor/react"
import type { editor as MonacoEditorApi } from "monaco-editor"
import { cn } from "@/lib/utils"

const JOOSC_THEME = "joosc-dark-plus"
const JOOSC_ASSEMBLY_LANGUAGE = "joosc-assembly"

let isMonacoConfigured = false

function configureMonaco(monaco: Monaco) {
  if (isMonacoConfigured) {
    return
  }

  if (
    !monaco.languages
      .getLanguages()
      .some((language: { id: string }) => language.id === JOOSC_ASSEMBLY_LANGUAGE)
  ) {
    monaco.languages.register({ id: JOOSC_ASSEMBLY_LANGUAGE })
    monaco.languages.setLanguageConfiguration(JOOSC_ASSEMBLY_LANGUAGE, {
      comments: { lineComment: ";" },
      brackets: [
        ["[", "]"],
        ["(", ")"],
      ],
      autoClosingPairs: [
        { open: "[", close: "]" },
        { open: "(", close: ")" },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
      ],
    })
    monaco.languages.setMonarchTokensProvider(JOOSC_ASSEMBLY_LANGUAGE, {
      ignoreCase: true,
      defaultToken: "",
      tokenizer: {
        root: [
          [/;.*$/, "comment"],
          [/^\s*[A-Za-z_.$][\w.$]*:/, "type.identifier"],
          [/\b(?:section|global|extern|align|equ|times|bits|org)\b/, "keyword.directive"],
          [/\b(?:db|dw|dd|dq|dt|do|dy|dz|resb|resw|resd|resq|rest|reso|resy|resz)\b/, "keyword.directive"],
          [
            /\b(?:mov|lea|push|pop|call|ret|cmp|test|jmp|je|jne|jg|jge|jl|jle|ja|jae|jb|jbe|jo|jno|js|jns|add|sub|imul|mul|idiv|div|inc|dec|neg|not|and|or|xor|sal|sar|shl|shr|nop|int|enter|leave)\b/,
            "keyword",
          ],
          [/\b(?:eax|ebx|ecx|edx|esi|edi|esp|ebp|eip|ax|bx|cx|dx|si|di|sp|bp|al|ah|bl|bh|cl|ch|dl|dh|cs|ds|es|fs|gs|ss)\b/, "variable.predefined"],
          [/0x[0-9a-f]+/, "number.hex"],
          [/\b\d+\b/, "number"],
          [/"([^"\\]|\\.)*"/, "string"],
          [/'([^'\\]|\\.)*'/, "string"],
          [/[()[\],]/, "@brackets"],
          [/[+\-*/%]/, "operator"],
          [/[A-Za-z_.$][\w.$]*/, "identifier"],
        ],
      },
    })
  }

  monaco.editor.defineTheme(JOOSC_THEME, {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6A9955" },
      { token: "keyword", foreground: "569CD6" },
      { token: "keyword.directive", foreground: "C586C0" },
      { token: "variable.predefined", foreground: "9CDCFE" },
      { token: "type.identifier", foreground: "4EC9B0" },
      { token: "number", foreground: "B5CEA8" },
      { token: "number.hex", foreground: "B5CEA8" },
      { token: "string", foreground: "CE9178" },
    ],
    colors: {
      "editor.background": "#1E1E1E",
      "editor.foreground": "#D4D4D4",
      "editor.lineHighlightBackground": "#2A2D2E",
      "editor.selectionBackground": "#264F78",
      "editor.inactiveSelectionBackground": "#3A3D41",
      "editorCursor.foreground": "#AEAFAD",
      "editorWhitespace.foreground": "#3B3B3B",
      "editorIndentGuide.background1": "#404040",
      "editorIndentGuide.activeBackground1": "#707070",
      "editorLineNumber.foreground": "#858585",
      "editorLineNumber.activeForeground": "#C6C6C6",
      "editorGutter.background": "#1E1E1E",
      "editorBracketMatch.background": "#4D4D4D33",
      "editorBracketMatch.border": "#515C6A",
      "scrollbarSlider.background": "#79797966",
      "scrollbarSlider.hoverBackground": "#646464B3",
      "scrollbarSlider.activeBackground": "#BFBFBF66",
      "minimap.background": "#1E1E1E",
    },
  })

  isMonacoConfigured = true
}

interface MonacoCodeSurfaceProps {
  value: string
  language: string
  path?: string
  readOnly?: boolean
  height?: number | string
  className?: string
  onChange?: (value: string) => void
  options?: MonacoEditorApi.IStandaloneEditorConstructionOptions
}

export default function MonacoCodeSurface({
  value,
  language,
  path,
  readOnly = false,
  height = 400,
  className,
  onChange,
  options,
}: MonacoCodeSurfaceProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <Editor
        beforeMount={configureMonaco}
        height={height}
        theme={JOOSC_THEME}
        language={language}
        path={path}
        value={value}
        onChange={(nextValue) => onChange?.(nextValue ?? "")}
        loading={
          <div className="flex h-full min-h-[220px] items-center justify-center bg-[#1E1E1E] px-4 text-sm text-zinc-400">
            Initializing Monaco editor...
          </div>
        }
        options={{
          automaticLayout: true,
          contextmenu: true,
          cursorBlinking: "smooth",
          domReadOnly: readOnly,
          fontFamily: "var(--font-geist-mono), ui-monospace, SFMono-Regular, monospace",
          fontLigatures: false,
          fontSize: 13,
          formatOnPaste: !readOnly,
          formatOnType: !readOnly,
          guides: {
            bracketPairs: true,
            indentation: true,
          },
          lineDecorationsWidth: 12,
          lineNumbersMinChars: 4,
          minimap: { enabled: false },
          padding: { top: 16, bottom: 16 },
          readOnly,
          renderLineHighlight: "all",
          roundedSelection: true,
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          tabSize: 2,
          wordWrap: "off",
          ...options,
        }}
      />
    </div>
  )
}
