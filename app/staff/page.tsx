"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getCurrentUser, getCurrentClient } from "@/lib/users"
import { getEnabledModules, getDefaultEnabledModules } from "@/lib/staffModules"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useTheme } from "@/hooks/useTheme"

export default function StaffMenu() {
  const router = useRouter()
  const theme = useTheme()
  const [enabledModules, setEnabledModules] = useState<any[]>([])
  const [currentClient, setCurrentClient] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadClientModules = async () => {
      try {
        const user = getCurrentUser()
        if (!user) {
          router.push("/")
          return
        }

        const client = await getCurrentClient()
        setCurrentClient(client)

        if (client && client.enabledModules) {
          const modules = getEnabledModules(client.enabledModules)
          setEnabledModules(modules)
        } else {
          // Si no hay módulos configurados, usar los por defecto
          const defaultModules = getEnabledModules(getDefaultEnabledModules())
          setEnabledModules(defaultModules)
        }
      } catch (error) {
        console.error("Error loading client modules:", error)
        // En caso de error, mostrar módulos por defecto
        const defaultModules = getEnabledModules(getDefaultEnabledModules())
        setEnabledModules(defaultModules)
      } finally {
        setLoading(false)
      }
    }

    loadClientModules()
  }, [router])

  // Verificación de seguridad para el tema
  const safeTheme = theme || {
    bgColor: "bg-white",
    textColor: "text-gray-900",
    primaryColor: "bg-blue-600",
    borderColor: "border-gray-300",
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${safeTheme.bgColor} ${safeTheme.textColor} p-4 flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Cargando panel de staff...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${safeTheme.bgColor} ${safeTheme.textColor} p-4`}>
      <div className="flex justify-between items-center mb-6">
        <Link href="/">
          <Button variant="outline" className={`${safeTheme.borderColor} ${safeTheme.textColor} hover:bg-gray-100`}>
            Volver al inicio
          </Button>
        </Link>
        <div className="flex flex-col items-center">
          {/* Logo del cliente o genérico */}
          {currentClient?.logo ? (
            <img
              src={currentClient.logo || "/placeholder.svg"}
              alt={`Logo ${currentClient.clubName || currentClient.name}`}
              className="w-16 h-16 rounded-full object-cover mb-2"
            />
          ) : (
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-2">
              <span className="text-white text-xl font-bold">
                {currentClient?.clubName ? currentClient.clubName.charAt(0).toUpperCase() : "SD"}
              </span>
            </div>
          )}
          <h1 className={`text-3xl font-bold ${safeTheme.textColor} text-center`}>Panel del Staff</h1>
          {currentClient && (
            <p className="text-sm text-gray-600 mt-1">{currentClient.clubName || currentClient.name}</p>
          )}
        </div>
        <div className="w-20"></div>
      </div>

      {enabledModules.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-gray-500 text-3xl">🚫</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Sin módulos habilitados</h2>
            <p className="text-gray-500 mb-6">
              Este cliente no tiene módulos del panel de staff habilitados. Contacta al administrador para configurar
              los módulos disponibles.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>💡 Información:</strong> Los administradores pueden configurar qué funcionalidades están
                disponibles para cada cliente desde el panel de administración.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 w-full max-w-md mx-auto mt-8">
          {enabledModules.map((module) => (
            <Button
              key={module.id}
              className={`w-full ${safeTheme.primaryColor} text-white hover:opacity-90 text-xl py-6 transition`}
              onClick={() => router.push(module.route)}
            >
              {module.icon} {module.name}
            </Button>
          ))}

          {enabledModules.length < 7 && (
            <div className="mt-4 p-3 bg-gray-100 rounded-lg text-center">
              <p className="text-sm text-gray-600">
                <strong>ℹ️ Nota:</strong> Algunos módulos pueden estar deshabilitados para este cliente.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
