import type { Metadata } from "next"
import { Badge } from "@/components/ui/badge"
import JavaCompilerSandbox from "@/components/java-compiler-sandbox"

export const metadata: Metadata = {
  title: "Java 1.3 Compiler | Dev Narula",
  description:
    "Write multiple Java source files, compile them with joosc, and browse the generated assembly tree in a file explorer-style viewer.",
}

export default function JavaCompilerPage() {
  return (
    <div className="container max-w-6xl py-8 md:py-12 mx-auto space-y-8">
      <div className="space-y-4 text-center">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Badge variant="secondary">Multi-file workspace</Badge>
          <Badge variant="secondary">joosc pipeline</Badge>
          <Badge variant="secondary">Assembly viewer</Badge>
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold">Java 1.3 Compiler</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Create multiple <code className="rounded bg-muted px-1.5 py-0.5 text-sm">.java</code> files and run a
            server-side <code className="rounded bg-muted px-1.5 py-0.5 text-sm">bin/joosc</code> compile inside an
            isolated temp workspace, then inspect the generated <code className="rounded bg-muted px-1.5 py-0.5 text-sm">output/**/*.s</code> files
            in a dedicated explorer-style viewer.
          </p>
          <p className="text-sm text-muted-foreground max-w-3xl mx-auto">
            The build expects <code className="rounded bg-muted px-1.5 py-0.5 text-sm">bin/joosc</code> plus
            <code className="rounded bg-muted px-1.5 py-0.5 text-sm">bin/stdlib/runtime.s</code>, and it automatically
            includes every <code className="rounded bg-muted px-1.5 py-0.5 text-sm">bin/stdlib/**/*.java</code> source
            in the compile step. If a local or deployed tool is missing, its startup error is returned in the build
            log.
          </p>
        </div>
      </div>

      <JavaCompilerSandbox />
    </div>
  )
}
