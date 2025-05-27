"use client"

import { clubThemes, getCurrentTheme, type ClubTheme } from "@/lib/themes"
import { useEffect, useState } from "react"

export const useTheme = (theme?: ClubTheme) => {
  const [currentTheme, setCurrentTheme] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Obtener tema inicial
    const initialTheme = getCurrentTheme()
    setCurrentTheme(initialTheme)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Escuchar cambios en localStorage para temas dinámicos
    const handleStorageChange = () => {
      const newTheme = getCurrentTheme()
      console.log("🔄 Theme changed via storage:", newTheme.clubName || "Unknown")
      setCurrentTheme(newTheme)
    }

    window.addEventListener("storage", handleStorageChange)

    // También escuchar cambios internos
    const interval = setInterval(() => {
      const newTheme = getCurrentTheme()
      if (JSON.stringify(newTheme) !== JSON.stringify(currentTheme)) {
        console.log("🔄 Theme changed internally:", newTheme.clubName || "Unknown")
        setCurrentTheme(newTheme)
      }
    }, 1000)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }, [currentTheme, mounted])

  // Si no está montado, devolver tema por defecto
  if (!mounted) {
    return clubThemes.default
  }

  const finalTheme = theme ? clubThemes[theme] : currentTheme || clubThemes.default
  console.log("🎨 useTheme returning:", finalTheme.clubName || "Unknown", finalTheme.primaryColor)

  return finalTheme
}
