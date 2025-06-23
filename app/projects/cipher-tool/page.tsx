import type { Metadata } from "next"
import CipherDecryptionTool from "@/components/cipher-decryption-tool"

export const metadata: Metadata = {
  title: "Cipher Decryption Tool | Dev Narula",
  description: "Decrypt text encrypted with classical ciphers like Caesar, Vigenère, Substitution, and Affine.",
}

export default function CipherToolPage() {
  return (
    <div className="container max-w-4xl py-8 md:py-12 mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Cipher Decryption Tool</h1>
        <p className="text-lg text-muted-foreground">
          Decrypt text encrypted with classical ciphers like Caesar, Vigenère, Substitution, and Affine.
        </p>
      </div>

      <div className="flex justify-center">
        <CipherDecryptionTool />
      </div>
    </div>
  )
}
