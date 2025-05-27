"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getCurrentUser, getCurrentClient } from "@/lib/users"
import { getEnabledModules, getDefaultEnabledModules } from "@/lib/staffModules"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useTheme } from "@/hooks/useTheme"
import { setThemeForClient, getCurrentTheme } from "@/lib/themes"

export default function StaffMenu() {
  const router = useRouter()
  const [enabledModules, setEnabledModules] = useState<any[]>([])
  const [currentClient, setCurrentClient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [themeReady, setThemeReady] = useState(false)
  const theme = useTheme()

  // Asegurar que el componente esté montado en el cliente
  useEffect(() => {
    setMounted(true)
  }, [])

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

        // Aplicar tema del cliente si existe
        if (client) {
          console.log("🎨 Loading theme for client:", client.name, "Theme:", client.theme)
          await setThemeForClient(client)

          // Esperar a que el tema se aplique
          setTimeout(() => {
            setThemeReady(true)
          }, 200)
        } else {
          setThemeReady(true)
        }

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
        setThemeReady(true)
      } finally {
        setLoading(false)
      }
    }

    if (mounted) {
      loadClientModules()
    }
  }, [router, mounted])

  // Obtener el tema actual con colores
  const currentTheme = getCurrentTheme()

  // Extraer colores del tema
  const getThemeColors = () => {
    if (currentTheme?.colors) {
      // Tema personalizado
      return {
        primary: currentTheme.colors.primary,
        background: currentTheme.colors.background,
        text: currentTheme.colors.text,
      }
    } else if (currentTheme) {
      // Tema predefinido - mapear a colores hex
      const colorMap: { [key: string]: string } = {
        "bg-blue-600": "#2563EB",
        "bg-yellow-500": "#EAB308",
        "bg-red-500": "#EF4444",
        "bg-black": "#000000",
        "bg-white": "#FFFFFF",
        "text-gray-900": "#111827",
        "text-yellow-400": "#FACC15",
        "text-blue-800": "#1E40AF",
      }

      let primaryColor = "#2563EB" // default blue
      let backgroundColor = "#FFFFFF" // default white
      let textColor = "#111827" // default gray-900

      // Extraer color primario
      if (currentTheme.primaryColor?.includes("yellow")) {
        primaryColor = "#EAB308"
      } else if (currentTheme.primaryColor?.includes("red")) {
        primaryColor = "#EF4444"
      }

      // Extraer color de fondo
      if (currentTheme.bgColor?.includes("black")) {
        backgroundColor = "#000000"
      }

      // Extraer color de texto
      if (currentTheme.textColor?.includes("yellow")) {
        textColor = "#FACC15"
      } else if (currentTheme.textColor?.includes("blue-800")) {
        textColor = "#1E40AF"
      }

      return {
        primary: primaryColor,
        background: backgroundColor,
        text: textColor,
      }
    }

    // Fallback
    return {
      primary: "#2563EB",
      background: "#FFFFFF",
      text: "#111827",
    }
  }

  const themeColors = getThemeColors()

  // Verificación de seguridad para el tema
  const safeTheme = theme || {
    bgColor: "bg-white",
    textColor: "text-gray-900",
    primaryColor: "bg-blue-600 hover:bg-blue-700",
    borderColor: "border-gray-300",
  }

  // No renderizar nada hasta que esté montado en el cliente y el tema esté listo
  if (!mounted || loading || !themeReady) {
    return (
      <div className="min-h-screen bg-white text-gray-900 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Cargando panel de staff...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen p-4"
      style={{
        backgroundColor: themeColors.background,
        color: themeColors.text,
      }}
    >
      <div className="flex justify-between items-center mb-6">
        <Link href="/">
          <Button variant="outline" className={`${safeTheme.borderColor} hover:bg-gray-100`}>
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
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-2"
              style={{ backgroundColor: themeColors.primary }}
            >
              <span className="text-white text-xl font-bold">
                {currentClient?.clubName ? currentClient.clubName.charAt(0).toUpperCase() : "SD"}
              </span>
            </div>
          )}
          <h1 className="text-3xl font-bold text-center" style={{ color: themeColors.text }}>
            Panel del Staff
          </h1>
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
            <button
              key={module.id}
              className="w-full font-semibold text-lg py-6 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 min-h-[80px] shadow-lg hover:shadow-xl transform hover:scale-105 text-white"
              style={{
                backgroundColor: themeColors.primary,
                color: "white",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.9"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1"
              }}
              onClick={() => router.push(module.route)}
            >
              <span className="text-2xl" role="img" aria-label={module.name}>
                {module.icon}
              </span>
              <span className="text-lg font-semibold">{module.name}</span>
            </button>
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
