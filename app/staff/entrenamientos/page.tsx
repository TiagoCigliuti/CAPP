"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { clubThemes, getCurrentTheme } from "@/lib/themes"
import { useState, useEffect } from "react"

export default function EntrenamientosPage() {
  const router = useRouter()
  const [theme, setTheme] = useState(clubThemes.default)

  useEffect(() => {
    const currentTheme = getCurrentTheme()
    setTheme(clubThemes[currentTheme])
  }, [])

  return (
    <div className={`min-h-screen ${theme.bgColor} ${theme.textColor} p-6`}>
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <Link href="/staff">
          <Button variant="outline" className={`${theme.borderColor} ${theme.textColor} hover:bg-gray-100`}>
            Volver al panel
          </Button>
        </Link>
        <div className="flex flex-col items-center">
          {theme.logo && (
            <div className="relative w-[80px] h-[100px] mb-2">
              <Image src={theme.logo || "/placeholder.svg"} alt="Logo" fill className="object-contain" />
            </div>
          )}
          <h1 className={`text-3xl font-bold ${theme.textColor} text-center`}>Gestión de Entrenamientos</h1>
        </div>
        <div className="w-20" /> {/* Espaciador */}
      </div>

      {/* Botones de navegación */}
      <div className="grid gap-6 w-full max-w-md mx-auto mt-8">
        <Button
          onClick={() => router.push("/staff/entrenamientos/planificacion")}
          className={`w-full ${theme.secondaryColor} text-white hover:bg-gray-700 text-xl py-6`}
        >
          🗓️ Planificación
        </Button>
        <Button
          onClick={() => router.push("/staff/entrenamientos/gestion")}
          className={`w-full ${theme.secondaryColor} text-white hover:bg-gray-700 text-xl py-6`}
        >
          🛠️ Gestión de tareas
        </Button>
      </div>
    </div>
  )
}
