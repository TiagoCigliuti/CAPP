"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"
import Link from "next/link"

export default function StaffLogin() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const verifyPassword = () => {
    setIsSubmitting(true)
    setError("")

    if (password === "1891") {
      router.push("/staff")
    } else {
      setError("Contraseña incorrecta")
      toast({
        title: "Error de acceso",
        description: "La contraseña ingresada es incorrecta",
        variant: "destructive",
      })
    }

    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-gray-300 px-4">
      <div className="mb-6">
        <div className="relative w-[100px] h-[120px]">
          <Image src="/penarol-white-bg.png" alt="Escudo Peñarol" fill className="object-contain" />
        </div>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-8 text-center">Acceso Staff</h1>

      <div className="w-full max-w-xs space-y-4">
        <div className="space-y-2">
          <Label htmlFor="staff-password" className="text-gray-300">
            Contraseña
          </Label>
          <Input
            id="staff-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                verifyPassword()
              }
            }}
            className="bg-gray-800 border-gray-700 text-white"
            placeholder="Ingrese la contraseña"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>

        <Button
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-black"
          onClick={verifyPassword}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Verificando..." : "Ingresar"}
        </Button>

        <div className="text-center mt-4">
          <Link href="/" className="text-yellow-400 hover:text-yellow-300 text-sm">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
