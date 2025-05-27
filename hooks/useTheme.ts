"use client"

import { clubThemes, getCurrentTheme, forceApplyTheme, type ClubTheme } from "@/lib/themes"
import { useEffect, useState } from "react"

export const useTheme = (theme?: ClubTheme) => {
  const [currentTheme, setCurrentTheme] = useState(() => getCurrentTheme())

  useEffect(() => {
    // Escuchar cambios en localStorage para temas dinámicos
    const handleStorageChange = () => {
      const newTheme = getCurrentTheme()
      setCurrentTheme(newTheme)
    }

    window.addEventListener("storage", handleStorageChange)

    // También escuchar cambios internos con mayor frecuencia
    const interval = setInterval(() => {
      const newTheme = getCurrentTheme()
      if (JSON.stringify(newTheme) !== JSON.stringify(currentTheme)) {
        setCurrentTheme(newTheme)
      }
    }, 500) // Verificar cada 500ms

    // Forzar aplicación del tema al montar el componente
    setTimeout(() => {
      forceApplyTheme()
    }, 200)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }, [currentTheme])

  return theme ? clubThemes[theme] : currentTheme
}
