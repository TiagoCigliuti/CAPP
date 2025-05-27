"use client"

import type React from "react"
import { initializeTheme } from "@/lib/themes"
import { useEffect } from "react"

function ThemeInitializer() {
  useEffect(() => {
    initializeTheme()
  }, [])

  return null
}

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <ThemeInitializer />
      {children}
      {/* Theme switcher oculto - se activará según el usuario */}
      {/* <ThemeSwitcher /> */}
    </>
  )
}
