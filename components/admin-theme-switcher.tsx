"use client"

import ThemeSwitcher from "./theme-switcher"
import { getCurrentUser, isAdmin } from "@/lib/users"
import { useEffect, useState } from "react"

interface AdminThemeSwitcherProps {
  isAdmin?: boolean
}

export default function AdminThemeSwitcher({ isAdmin: propIsAdmin = false }: AdminThemeSwitcherProps) {
  const [showSwitcher, setShowSwitcher] = useState(false)

  useEffect(() => {
    const user = getCurrentUser()
    const userIsAdmin = user ? isAdmin(user) : false

    // Mostrar en modo desarrollo o si es admin
    const shouldShow = process.env.NODE_ENV === "development" || propIsAdmin || userIsAdmin
    setShowSwitcher(shouldShow)
  }, [propIsAdmin])

  return <ThemeSwitcher visible={showSwitcher} adminMode={showSwitcher} />
}
