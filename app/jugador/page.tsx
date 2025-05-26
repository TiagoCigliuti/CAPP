"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { getCurrentUser, clearCurrentUser, isJugador } from "@/lib/users"
import { clubThemes, getCurrentTheme, clearUserTheme } from "@/lib/themes"
import Image from "next/image"
import Link from "next/link"

export default function JugadorPage() {
  const router = useRouter()
  const [theme, setTheme] = useState(clubThemes.default)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const currentTheme = getCurrentTheme()
    setTheme(clubThemes[currentTheme])

    const user = getCurrentUser()
    setCurrentUser(user)

    // Verificar que el usuario sea jugador
    if (!user || !isJugador(user)) {
      router.push("/login")
    }
  }, [router])

  const handleLogout = () => {
    clearCurrentUser()
    clearUserTheme()
    router.push("/")
  }

  if (!currentUser || !isJugador(currentUser)) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Verificando acceso de jugador...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${theme.bgColor} ${theme.textColor} p-4`}>
      <div className="flex justify-between items-center mb-6">
        <Link href="/">
          <Button variant="outline" className={`${theme.borderColor} ${theme.textColor} hover:bg-gray-100`}>
            Volver al inicio
          </Button>
        </Link>
        <div className="flex flex-col items-center">
          {theme.logo && (
            <div className="relative w-[80px] h-[100px] mb-2">
              <Image src={theme.logo || "/placeholder.svg"} alt="Logo" fill className="object-contain" />
            </div>
          )}
          <h1 className={`text-3xl font-bold ${theme.textColor} text-center`}>Portal del Jugador</h1>
          <p className="text-sm text-gray-600 mt-1">Bienvenido, {currentUser.username}</p>
        </div>
        <Button onClick={handleLogout} variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
          Cerrar Sesión
        </Button>
      </div>

      <div className="grid gap-6 w-full max-w-md mx-auto mt-8">
        <Button
          className={`w-full ${theme.secondaryColor} text-white hover:bg-gray-700 text-xl py-6 transition`}
          onClick={() => router.push("/players")}
        >
          📝 Completar Formularios
        </Button>
        <Button
          className={`w-full ${theme.secondaryColor} text-white hover:bg-gray-700 text-xl py-6 transition`}
          onClick={() => router.push("/jugador/perfil")}
        >
          👤 Mi Perfil
        </Button>
        <Button
          className={`w-full ${theme.secondaryColor} text-white hover:bg-gray-700 text-xl py-6 transition`}
          onClick={() => router.push("/jugador/estadisticas")}
        >
          📊 Mis Estadísticas
        </Button>
        <Button
          className={`w-full ${theme.secondaryColor} text-white hover:bg-gray-700 text-xl py-6 transition`}
          onClick={() => router.push("/jugador/calendario")}
        >
          📅 Mi Calendario
        </Button>
      </div>
    </div>
  )
}
