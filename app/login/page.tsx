"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { authenticateUser, setCurrentUser, getRouteForRole } from "@/lib/users"
import { setThemeForUser } from "@/lib/themes"
import Image from "next/image"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLogin = () => {
    setIsSubmitting(true)
    setError("")

    const user = authenticateUser(username, password)

    if (user) {
      // Guardar usuario actual
      setCurrentUser(user)

      // Establecer el tema según el usuario
      const userTheme = setThemeForUser(user)

      // Mostrar mensaje de bienvenida
      toast({
        title: "Acceso exitoso",
        description: `Bienvenido ${user.username}`,
      })

      // Redirigir según el rol
      const route = getRouteForRole(user.role)
      router.push(route)
    } else {
      setError("Usuario o contraseña incorrectos.")
      toast({
        title: "Error de acceso",
        description: "Las credenciales ingresadas son incorrectas",
        variant: "destructive",
      })
    }

    setIsSubmitting(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="relative w-[80px] h-[100px]">
            <Image src="/penarol-white-bg.png" alt="Logo" fill className="object-contain" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-900">Bienvenido al sistema</h1>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-gray-700">
              Nombre de usuario
            </Label>
            <Input
              id="username"
              placeholder="Nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-white border-gray-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700">
              Contraseña
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-white border-gray-300"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={handleLogin}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Ingresando..." : "Ingresar"}
          </Button>
        </div>

        <div className="text-center mt-4">
          <Link href="/" className="text-gray-600 hover:text-gray-800 text-sm">
            Volver al inicio
          </Link>
        </div>

        {/* Información de usuarios para desarrollo */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-6 p-3 bg-gray-100 rounded text-xs text-gray-600">
            <p className="font-semibold mb-2">Usuarios de prueba:</p>
            <div className="space-y-1">
              <p>
                <strong>Admins:</strong>
              </p>
              <p>Admin1 / 1891</p>
              <p>Admin2 / 2025</p>
              <p>
                <strong>Staff:</strong>
              </p>
              <p>PenarolStaff / penarol123</p>
              <p>NacionalStaff / nacional123</p>
              <p>
                <strong>Jugador:</strong>
              </p>
              <p>Jugador1 / jugador123</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
