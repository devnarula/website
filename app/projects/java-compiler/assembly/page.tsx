import type { Metadata } from "next"
import JavaAssemblyViewer from "@/components/java-assembly-viewer"

export const metadata: Metadata = {
  title: "Assembly Viewer | Dev Narula",
  description: "Browse generated joosc assembly files in a Monaco-powered explorer viewer.",
}

export default function JavaCompilerAssemblyPage() {
  return (
    <div className="container mx-auto max-w-7xl py-8 md:py-12">
      <JavaAssemblyViewer />
    </div>
  )
}
