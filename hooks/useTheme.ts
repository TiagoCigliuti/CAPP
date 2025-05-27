"use client"

import { clubThemes, getCurrentTheme, type ClubTheme } from "@/lib/themes"
import { useEffect, useState } from "react"

export const useTheme = (theme?: ClubTheme) => {
  const [currentTheme, setCurrentTheme] = useState(() => getCurrentTheme())

  useEffect(() => {
    // Escuchar cambios en localStorage para temas dinámicos
    const handleStorageChange = () => {
      setCurrentTheme(getCurrentTheme())
    }

    window.addEventListener("storage", handleStorageChange)

    // También escuchar cambios internos
    const interval = setInterval(() => {
      const newTheme = getCurrentTheme()
      if (JSON.stringify(newTheme) !== JSON.stringify(currentTheme)) {
        setCurrentTheme(newTheme)
      }
    }, 1000)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }, [currentTheme])

  return theme ? clubThemes[theme] : currentTheme
}
