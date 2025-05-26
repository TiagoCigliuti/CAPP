"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getCurrentUser, getCurrentClient, clearCurrentUser, isClientUser } from "@/lib/users"
import { clubThemes, getCurrentTheme, clearUserTheme } from "@/lib/themes"
import { useEffect, useState } from "react"

export default function ClientDashboard() {
  const router = useRouter()
  const [theme, setTheme] = useState(clubThemes.default)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentClient, setCurrentClient] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentTheme = getCurrentTheme()
        setTheme(clubThemes[currentTheme])

        const user = getCurrentUser()
        setCurrentUser(user)

        if (user && isClientUser(user)) {
          const client = await getCurrentClient()
          setCurrentClient(client)
        }

        // Verificar que el usuario sea de cliente
        if (!user || !isClientUser(user)) {
          router.push("/")
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error)
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  const handleLogout = () => {
    clearCurrentUser()
    clearUserTheme()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!currentUser || !isClientUser(currentUser)) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Verificando acceso...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${theme.bgColor} ${theme.textColor} p-6 flex flex-col items-center justify-center`}>
      {/* Header con logout */}
      <div className="absolute top-4 right-4">
        <Button onClick={handleLogout} variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
          Cerrar Sesión
        </Button>
      </div>

      {/* Logo genérico */}
      <div className="mb-6">
        <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white text-3xl font-bold">SD</span>
        </div>
      </div>

      <h1 className={`${theme.textColor} text-3xl font-bold text-center mb-2`}>
        {currentClient?.name || "Sistema Deportivo"}
      </h1>
      <h2 className="text-gray-600 text-xl text-center mb-2">Gestión Deportiva</h2>
      <p className="text-gray-500 text-sm text-center mb-10">Usuario: {currentUser.username}</p>

      <div className="grid gap-6 w-full max-w-xs">
        <Button
          onClick={() => router.push("/players")}
          className={`w-full ${theme.primaryColor} text-white text-xl py-6`}
        >
          🧍 Ingreso Jugadores
        </Button>
        <Button
          onClick={() => router.push("/staff")}
          className={`w-full ${theme.primaryColor} text-white text-xl py-6`}
        >
          🧑‍💼 Ingreso Staff
        </Button>
      </div>
    </div>
  )
}
