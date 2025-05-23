"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { clubThemes, getCurrentTheme, setThemeForUser } from "@/lib/themes"
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

    if (password === "1891") {
      // Aquí puedes implementar la lógica para determinar el usuario y su tema
      // Por ejemplo, según la contraseña o un sistema de autenticación más complejo

      // Ejemplo de cómo asignar tema según usuario:
      const userId = "staff_user"
      const userRole = "default_staff"

      // Si en el futuro tienes diferentes contraseñas o usuarios:
      // if (password === "penarol123") {
      //   userId = "penarol_staff"
      //   userRole = "penarol_staff"
      // } else if (password === "nacional123") {
      //   userId = "nacional_staff"
      //   userRole = "nacional_staff"
      // }

      // Establecer el tema según el usuario
      const userTheme = setThemeForUser(userId, userRole)

      // Actualizar el tema local
      setTheme(clubThemes[userTheme])

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
      </div>
    </div>
  )
}
