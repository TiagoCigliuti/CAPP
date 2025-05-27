"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getCurrentTheme, getCurrentClient } from "@/lib/users"

export default function EntrenamientosPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [currentClient, setCurrentClient] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
    const loadClient = async () => {
      const client = await getCurrentClient()
      setCurrentClient(client)
    }
    loadClient()
  }, [])

  // Obtener colores del tema
  const getThemeColors = () => {
    const currentTheme = getCurrentTheme()

    if (currentTheme?.colors) {
      return {
        primary: currentTheme.colors.primary,
        background: currentTheme.colors.background,
        text: currentTheme.colors.text,
        secondary: currentTheme.colors.secondary,
      }
    } else if (currentTheme) {
      let primaryColor = "#2563EB"
      let backgroundColor = "#FFFFFF"
      let textColor = "#111827"
      const secondaryColor = "#1F2937"

      if (currentTheme.primaryColor?.includes("yellow")) {
        primaryColor = "#EAB308"
      } else if (currentTheme.primaryColor?.includes("red")) {
        primaryColor = "#EF4444"
      }

      if (currentTheme.bgColor?.includes("black")) {
        backgroundColor = "#000000"
      }

      if (currentTheme.textColor?.includes("yellow")) {
        textColor = "#FACC15"
      } else if (currentTheme.textColor?.includes("blue-800")) {
        textColor = "#1E40AF"
      }

      return {
        primary: primaryColor,
        background: backgroundColor,
        text: textColor,
        secondary: secondaryColor,
      }
    }

    return {
      primary: "#2563EB",
      background: "#FFFFFF",
      text: "#111827",
      secondary: "#1F2937",
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white text-gray-900 p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const themeColors = getThemeColors()
  const currentTheme = getCurrentTheme()

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: themeColors.background, color: themeColors.text }}>
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <Link href="/staff">
          <Button variant="outline" className="hover:bg-gray-100">
            Volver al panel
          </Button>
        </Link>
        <div className="flex flex-col items-center">
          {currentTheme?.logo ? (
            <div className="relative w-[80px] h-[100px] mb-2">
              <Image src={currentTheme.logo || "/placeholder.svg"} alt="Logo" fill className="object-contain" />
            </div>
          ) : (
            <div
              className="w-[80px] h-[100px] mb-2 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: themeColors.primary }}
            >
              <span className="text-white text-2xl font-bold">
                {currentTheme?.clubName
                  ?.split(" ")
                  .map((word: string) => word[0])
                  .join("")
                  .slice(0, 2) || "SD"}
              </span>
            </div>
          )}
          <h1 className="text-3xl font-bold text-center" style={{ color: themeColors.text }}>
            Gestión de Entrenamientos
          </h1>
        </div>
        <div className="w-20" />
      </div>

      {/* Botones de navegación */}
      <div className="grid gap-6 w-full max-w-md mx-auto mt-8">
        <button
          onClick={() => router.push("/staff/entrenamientos/planificacion")}
          className="w-full text-white text-xl py-6 px-4 rounded-lg font-semibold transition-all duration-200 hover:opacity-90 flex items-center justify-center gap-3"
          style={{ backgroundColor: themeColors.secondary }}
        >
          <span className="text-2xl">🗓️</span>
          <span>Planificación</span>
        </button>
        <button
          onClick={() => router.push("/staff/entrenamientos/gestion")}
          className="w-full text-white text-xl py-6 px-4 rounded-lg font-semibold transition-all duration-200 hover:opacity-90 flex items-center justify-center gap-3"
          style={{ backgroundColor: themeColors.secondary }}
        >
          <span className="text-2xl">🛠️</span>
          <span>Gestión de tareas</span>
        </button>
      </div>
    </div>
  )
}
