"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { clubThemes, getCurrentTheme } from "@/lib/themes"
import { useState, useEffect } from "react"

export default function CargaExternaPage() {
  const [theme, setTheme] = useState(clubThemes.default)

  useEffect(() => {
    const currentTheme = getCurrentTheme()
    setTheme(clubThemes[currentTheme])
  }, [])

  return (
    <div className={`min-h-screen ${theme.bgColor} ${theme.textColor} p-4`}>
      <div className="flex justify-between items-center mb-6">
        <Link href="/staff">
          <Button variant="outline" className={`${theme.borderColor} ${theme.textColor} hover:bg-gray-100`}>
            Volver
          </Button>
        </Link>
        <div className="flex flex-col items-center">
          {theme.logo && (
            <div className="relative w-[50px] h-[60px] mb-2">
              <Image src={theme.logo || "/placeholder.svg"} alt="Logo" fill className="object-contain" />
            </div>
          )}
          <h1 className={`text-2xl font-bold text-center ${theme.textColor}`}>Carga Externa</h1>
        </div>
        <div className="w-20"></div>
      </div>

      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className={`text-center p-8 ${theme.cardBg} border ${theme.borderColor} rounded-xl max-w-md`}>
          <h2 className={`text-xl font-semibold ${theme.textColor} mb-4`}>Sección en Desarrollo</h2>
          <p className="mb-4 text-gray-600">Esta sección está actualmente en desarrollo. Pronto estará disponible.</p>
          <Link href="/staff">
            <Button className={`${theme.primaryColor} text-white`}>Volver al menú principal</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
