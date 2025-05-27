"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useState, useEffect } from "react"
import { getCurrentTheme, getCurrentClient } from "@/lib/users"

export default function EvaluacionesPage() {
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
      // Tema personalizado
      return {
        primary: currentTheme.colors.primary,
        background: currentTheme.colors.background,
        text: currentTheme.colors.text,
      }
    } else if (currentTheme) {
      // Tema predefinido - mapear a colores hex
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
    <div className="min-h-screen p-4" style={{ backgroundColor: themeColors.background, color: themeColors.text }}>
      <div className="flex justify-between items-center mb-6">
        <Link href="/staff">
          <Button variant="outline" className="border-gray-700 hover:bg-gray-100">
            Volver
          </Button>
        </Link>
        <div className="flex flex-col items-center">
          {currentTheme?.logo ? (
            <div className="relative w-[50px] h-[60px] mb-2">
              <Image src={currentTheme.logo || "/placeholder.svg"} alt="Escudo" fill className="object-contain" />
            </div>
          ) : (
            <div
              className="w-[50px] h-[60px] mb-2 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: themeColors.primary }}
            >
              <span className="text-white text-lg font-bold">{currentTheme?.clubName?.charAt(0) || "SD"}</span>
            </div>
          )}
          <h1 className="text-2xl font-bold text-center" style={{ color: themeColors.text }}>
            Evaluaciones
          </h1>
        </div>
        <div className="w-20"></div>
      </div>

      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div
          className="text-center p-8 border rounded-xl max-w-md"
          style={{ backgroundColor: themeColors.background, borderColor: themeColors.primary }}
        >
          <h2 className="text-xl font-semibold mb-4" style={{ color: themeColors.primary }}>
            Sección en Desarrollo
          </h2>
          <p className="mb-4" style={{ color: themeColors.text }}>
            Esta sección está actualmente en desarrollo. Pronto estará disponible.
          </p>
          <Link href="/staff">
            <button
              className="px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 hover:opacity-90"
              style={{ backgroundColor: themeColors.primary }}
            >
              Volver al menú principal
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
