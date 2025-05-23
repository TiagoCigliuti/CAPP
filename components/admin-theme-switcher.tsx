"use client"

import ThemeSwitcher from "./theme-switcher"

interface AdminThemeSwitcherProps {
  isAdmin?: boolean
}

export default function AdminThemeSwitcher({ isAdmin = false }: AdminThemeSwitcherProps) {
  // Solo mostrar en modo desarrollo o si es admin
  const showSwitcher = process.env.NODE_ENV === "development" || isAdmin

  return <ThemeSwitcher visible={showSwitcher} adminMode={isAdmin} />
}
