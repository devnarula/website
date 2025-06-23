"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Copy, CheckCircle2, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CipherDecryptionTool() {
  const [ciphertext, setCiphertext] = useState("")
  const [cipherType, setCipherType] = useState("caesar")
  const [key, setKey] = useState("")
  const [result, setResult] = useState("")
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState("decrypt")
  const [isLoading, setIsLoading] = useState(false)

  const handleCipherOperation = async (operation: "encrypt" | "decrypt") => {
    if (!ciphertext.trim()) {
      setError("Please enter some text to process")
      return
    }

    // Only validate key for encryption
    if (operation === "encrypt" && !key.trim()) {
      setError("Please enter a key for encryption")
      return
    }

    setIsLoading(true)
    setError("")
    setResult("")

    try {
      const requestBody: any = {
        text: ciphertext,
        cipherType,
        operation,
      }

      // Only include key for encryption
      if (operation === "encrypt") {
        requestBody.key = key
      }

      const response = await fetch("/api/cipher", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to process cipher")
      }

      setResult(data.result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while processing the cipher")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleCipherOperation(activeTab as "encrypt" | "decrypt")
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy to clipboard:", err)
    }
  }

  const renderKeyInput = () => {
    // Only show key input for encryption
    if (activeTab !== "encrypt") {
      return null
    }

    switch (cipherType) {
      case "caesar":
        return (
          <div className="space-y-2">
            <Label htmlFor="shift" className="text-sm font-medium">
              Shift (0-25)
            </Label>
            <Input
              type="number"
              id="shift"
              placeholder="Enter shift value (e.g., 3)"
              value={key}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKey(e.target.value)}
              min="0"
              max="25"
              disabled={isLoading}
            />
          </div>
        )
      case "vigenere":
        return (
          <div className="space-y-2">
            <Label htmlFor="keyword" className="text-sm font-medium">
              Keyword
            </Label>
            <Input
              type="text"
              id="keyword"
              placeholder="Enter keyword (e.g., KEY)"
              value={key}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKey(e.target.value)}
              disabled={isLoading}
            />
          </div>
        )
      case "substitution":
        return (
          <div className="space-y-2">
            <Label htmlFor="alphabet" className="text-sm font-medium">
              Substitution Alphabet (26 letters)
            </Label>
            <Input
              type="text"
              id="alphabet"
              placeholder="Enter substitution alphabet (e.g., QWERTYUIOPASDFGHJKLZXCVBNM)"
              value={key}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKey(e.target.value)}
              maxLength={26}
              disabled={isLoading}
            />
          </div>
        )
      case "affine":
        return (
          <div className="space-y-2">
            <Label htmlFor="affine" className="text-sm font-medium">
              Affine Parameters (a,b)
            </Label>
            <Input
              type="text"
              id="affine"
              placeholder="Enter a,b (e.g., 5,8)"
              value={key}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKey(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              'a' must be coprime with 26 (valid values: 1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25)
            </p>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-2xl shadow-lg">
      <CardContent className="p-6 md:p-8">
        <Tabs defaultValue="decrypt" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="decrypt" disabled={isLoading}>
              Decrypt
            </TabsTrigger>
            <TabsTrigger value="encrypt" disabled={isLoading}>
              Encrypt
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="ciphertext" className="text-sm font-medium">
                {activeTab === "decrypt" ? "Ciphertext" : "Plaintext"}
              </Label>
              <Textarea
                id="ciphertext"
                placeholder={
                  activeTab === "decrypt" ? "Enter the encrypted text here..." : "Enter the text to encrypt here..."
                }
                value={ciphertext}
                onChange={(e) => setCiphertext(e.target.value)}
                className="min-h-[120px] resize-y"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cipher-type" className="text-sm font-medium">
                Cipher Type
              </Label>
              <Select value={cipherType} onValueChange={setCipherType} disabled={isLoading}>
                <SelectTrigger id="cipher-type">
                  <SelectValue placeholder="Select cipher type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="caesar">Caesar Cipher</SelectItem>
                  <SelectItem value="vigenere">Vigenère Cipher</SelectItem>
                  <SelectItem value="substitution">Substitution Cipher</SelectItem>
                  <SelectItem value="affine">Affine Cipher</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {renderKeyInput()}

            {activeTab === "decrypt" && (
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Smart Decryption</p>
                    <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                      No key required! My algorithm can automatically try to decrypt the ciphertext (given the text is generated in plaintext English).
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>{activeTab === "decrypt" ? "Decrypt Text" : "Encrypt Text"}</>
              )}
            </Button>
          </form>

          {error && (
            <Alert variant="destructive" className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="result" className="text-sm font-medium">
                  {activeTab === "decrypt" ? "Decrypted Result" : "Encrypted Result"}
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-2"
                  onClick={copyToClipboard}
                  disabled={isLoading}
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
              </div>
              <Textarea id="result" value={result} readOnly className="min-h-[120px] resize-y bg-muted/50 font-mono" />
            </div>
          )}
        </Tabs>
      </CardContent>
    </Card>
  )
}
