"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { clubThemes, getCurrentTheme, setThemeForUser } from "@/lib/themes"
import { authenticateUser, setCurrentUser } from "@/lib/users"
import { useEffect } from "react"
import Image from "next/image"
import Link from "next/link"

export default function StaffLogin() {
  const router = useRouter()
  const [theme, setTheme] = useState(clubThemes.default)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const currentTheme = getCurrentTheme()
    setTheme(clubThemes[currentTheme])
  }, [])

  const verifyPassword = () => {
    setIsSubmitting(true)
    setError("")

    // Autenticar usuario usando el sistema de usuarios
    const user = authenticateUser(password)

    if (user) {
      // Guardar usuario actual
      setCurrentUser(user)

      // Establecer el tema según el usuario
      const userTheme = setThemeForUser(user)
      setTheme(clubThemes[userTheme])

      // Mostrar mensaje de bienvenida
      toast({
        title: "Acceso exitoso",
        description: `Bienvenido ${user.username}`,
      })

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
    <div className={`min-h-screen ${theme.bgColor} flex flex-col items-center justify-center ${theme.textColor} px-4`}>
      {theme.logo && (
        <div className="mb-6">
          <div className="relative w-[100px] h-[120px]">
            <Image src={theme.logo || "/placeholder.svg"} alt="Logo" fill className="object-contain" />
          </div>
        </div>
      )}

      <h1 className={`text-2xl md:text-3xl font-bold ${theme.textColor} mb-8 text-center`}>Acceso Staff</h1>

      <div className="w-full max-w-xs space-y-4">
        <div className="space-y-2">
          <Label htmlFor="staff-password" className={theme.textColor}>
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
            className={`bg-white border ${theme.borderColor} ${theme.textColor}`}
            placeholder="Ingrese la contraseña"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        <Button onClick={verifyPassword} disabled={isSubmitting} className={`w-full ${theme.primaryColor} text-white`}>
          {isSubmitting ? "Verificando..." : "Ingresar"}
        </Button>

        <div className="text-center mt-4">
          <Link href="/" className="text-gray-600 hover:text-gray-800 text-sm">
            Volver al inicio
          </Link>
        </div>

        {/* Información de usuarios para desarrollo */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-6 p-3 bg-gray-100 rounded text-xs text-gray-600">
            <p className="font-semibold mb-1">Usuarios de prueba:</p>
            <p>Admin1: 1891</p>
            <p>Admin2: 2025</p>
          </div>
        )}
      </div>
    </div>
  )
}
