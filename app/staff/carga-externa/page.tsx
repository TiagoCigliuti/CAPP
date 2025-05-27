"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useEffect, useState } from "react"
import { getCurrentTheme, getCurrentClient } from "@/lib/users"

export default function CargaExternaPage() {
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
      }
    } else if (currentTheme) {
      let primaryColor = "#2563EB"
      let backgroundColor = "#FFFFFF"
      let textColor = "#111827"

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
      }
    }

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

  const clubName = currentTheme?.clubName || "Club"
  const clubInitials = clubName
    .split(" ")
    .map((word: string) => word[0])
    .join("")
    .toUpperCase()

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: themeColors.background, color: themeColors.text }}>
      <div className="flex justify-between items-center mb-6">
        <Link href="/staff">
          <Button variant="outline" className="hover:bg-gray-100">
            Volver
          </Button>
        </Link>
        <div className="flex flex-col items-center">
          {currentTheme?.logo ? (
            <div className="relative w-[50px] h-[60px] mb-2">
              <Image src={currentTheme.logo || "/placeholder.svg"} alt="Logo" fill className="object-contain" />
            </div>
          ) : (
            <div
              className="w-[50px] h-[60px] mb-2 rounded-lg flex items-center justify-center text-lg font-bold"
              style={{ backgroundColor: themeColors.primary, color: "white" }}
            >
              {clubInitials}
            </div>
          )}
          <h1 className="text-2xl font-bold text-center" style={{ color: themeColors.text }}>
            Carga Externa
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
