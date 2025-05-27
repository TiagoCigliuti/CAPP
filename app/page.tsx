"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { authenticateUser, setCurrentUser, isAdmin, initializeApp } from "@/lib/users"
import { setThemeForUser } from "@/lib/themes"
import { toast } from "@/hooks/use-toast"

export default function WelcomePage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    // Inicializar datos al cargar la aplicación
    const initialize = async () => {
      try {
        await initializeApp()
      } catch (error) {
        console.error("Error initializing app:", error)
      } finally {
        setIsInitializing(false)
      }
    }

    initialize()
  }, [])

  const handleLogin = async () => {
    setIsSubmitting(true)
    setError("")

    try {
      const user = await authenticateUser(username, password)

      if (user) {
        // Guardar usuario actual
        setCurrentUser(user)

        // Establecer tema según el usuario
        setThemeForUser(user)

        // Mostrar mensaje de bienvenida
        toast({
          title: "Acceso exitoso",
          description: `Bienvenido ${user.username}`,
        })

        // Redirigir según el rol
        if (isAdmin(user)) {
          router.push("/admin")
        } else {
          // Usuario de cliente va al panel de staff
          router.push("/staff")
        }
      } else {
        setError("Usuario o contraseña incorrectos, o cuenta inactiva.")
        toast({
          title: "Error de acceso",
          description: "Las credenciales son incorrectas o la cuenta está inactiva",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error during login:", error)
      setError("Error de conexión. Intente nuevamente.")
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin()
    }
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Inicializando sistema...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        {/* Logo genérico o sin logo */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">SD</span>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenido</h1>
          <p className="text-gray-600">Sistema de Gestión Deportiva</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-gray-700 font-medium">
              Usuario
            </Label>
            <Input
              id="username"
              placeholder="Ingrese su usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700 font-medium">
              Contraseña
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
            onClick={handleLogin}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Ingresando..." : "Ingresar"}
          </Button>
        </div>

        {/* Información de usuarios para desarrollo */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg text-xs text-gray-600">
            <p className="font-semibold mb-2">Usuarios de prueba:</p>
            <div className="space-y-1">
              <p>
                <strong>Administradores:</strong>
              </p>
              <p>Admin1 / 1891</p>
              <p>Admin2 / 2025</p>
              <p>
                <strong>Usuario de cliente:</strong>
              </p>
              <p>usuario_ejemplo / ejemplo123</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
