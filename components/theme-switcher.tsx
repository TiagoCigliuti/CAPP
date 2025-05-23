"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { clubThemes, getCurrentTheme, setCurrentTheme, type ClubTheme } from "@/lib/themes"
import { Settings } from "lucide-react"

interface ThemeSwitcherProps {
  visible?: boolean
  adminMode?: boolean
}

export default function ThemeSwitcher({ visible = false, adminMode = false }: ThemeSwitcherProps) {
  const [currentTheme, setCurrentThemeState] = useState<ClubTheme>("default")
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setCurrentThemeState(getCurrentTheme())
  }, [])

  const handleThemeChange = (theme: ClubTheme) => {
    setCurrentTheme(theme)
    setCurrentThemeState(theme)
    setIsOpen(false)
    // Force a page reload to apply the theme everywhere
    window.location.reload()
  }

  const getThemeDisplayName = (theme: ClubTheme) => {
    switch (theme) {
      case "default":
        return "Genérico"
      case "penarol":
        return "Peñarol"
      case "nacional":
        return "Nacional"
      default:
        return theme
    }
  }

  // No renderizar si no es visible y no está en modo admin
  if (!visible && !adminMode) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen && (
        <div className="mb-2 bg-white border border-gray-300 rounded-lg shadow-lg p-3 min-w-[150px]">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            {adminMode ? "Modo Admin - Seleccionar tema:" : "Seleccionar tema:"}
          </h3>
          <div className="space-y-1">
            {(Object.keys(clubThemes) as ClubTheme[]).map((themeName) => (
              <Button
                key={themeName}
                onClick={() => handleThemeChange(themeName)}
                variant={currentTheme === themeName ? "default" : "ghost"}
                className={`w-full justify-start text-sm ${
                  currentTheme === themeName
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {getThemeDisplayName(themeName)}
              </Button>
            ))}
          </div>
        </div>
      )}

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-800 hover:bg-gray-700 text-white w-12 h-12 p-0 rounded-full shadow-lg"
        title={adminMode ? "Configurar tema (Modo Admin)" : "Configurar tema"}
      >
        <Settings size={20} />
      </Button>
    </div>
  )
}
