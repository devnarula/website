import { type NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"

interface CipherRequest {
  text: string
  cipherType: string
  key?: string
  operation: "encrypt" | "decrypt"
}

export async function POST(request: NextRequest) {
  try {
    const body: CipherRequest = await request.json()
    const { text, cipherType, key, operation } = body

    // Validate input
    if (!text || !cipherType || !operation) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate key for encryption only
    if (operation === "encrypt" && !key) {
      return NextResponse.json({ error: "Key is required for encryption" }, { status: 400 })
    }

    // Path to your C++ executable (adjust this path as needed)
    const executablePath = path.join(process.cwd(), "bin", "cipher_tool")

    // Prepare arguments for the C++ executable
    const args = ["--operation", operation, "--cipher", cipherType, "--text", text]

    // Only add key argument for encryption
    if (operation === "encrypt" && key) {
      args.push("--key", key)
    }

    // Execute the C++ program
    const result = await executeCppProgram(executablePath, args)
    console.log("result",result);
    return NextResponse.json({ result })
  } catch (error) {
    console.error("Cipher API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}

function executeCppProgram(executablePath: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const process = spawn(executablePath, args)

    let stdout = ""
    let stderr = ""

    process.stdout.on("data", (data) => {
      stdout += data.toString()
    })

    process.stderr.on("data", (data) => {
      stderr += data.toString()
    })

    process.on("close", (code) => {
      if (code === 0) {
        resolve(stdout.trim())
      } else {
        reject(new Error(`The program exited with code ${code}: ${stderr}`))
      }
    })

    process.on("error", () => {
      reject(new Error(`Failed to start the binary`))
    })

    // Set a timeout to prevent hanging
    setTimeout(() => {
      process.kill()
      reject(new Error("The binary execution timed out"))
    }, 10000) // 10 second timeout
  })
}
