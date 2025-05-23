"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { clubThemes, getCurrentTheme } from "@/lib/themes"
import { useEffect, useState } from "react"

export default function HomePage() {
  const router = useRouter()
  const [theme, setTheme] = useState(clubThemes.default)

  useEffect(() => {
    const currentTheme = getCurrentTheme()
    setTheme(clubThemes[currentTheme])
  }, [])

  return (
    <div className={`min-h-screen ${theme.bgColor} ${theme.textColor} p-6 flex flex-col items-center justify-center`}>
      {theme.logo && (
        <div className="mb-6 relative w-[120px] h-[150px]">
          <Image src={theme.logo || "/placeholder.svg"} alt="Logo" fill className="object-contain" priority />
        </div>
      )}

      <h1 className={`${theme.textColor} text-3xl font-bold text-center mb-2`}>{theme.clubName}</h1>
      <h2 className="text-gray-600 text-xl text-center mb-10">Departamento de Ciencias del Deporte</h2>

      <div className="grid gap-6 w-full max-w-xs">
        <Button
          onClick={() => router.push("/players")}
          className={`w-full ${theme.secondaryColor} text-white text-xl py-6`}
        >
          🧍 Ingreso Jugadores
        </Button>
        <Button
          onClick={() => router.push("/staff-login")}
          className={`w-full ${theme.secondaryColor} text-white text-xl py-6`}
        >
          🧑‍💼 Ingreso Staff
        </Button>
      </div>
    </div>
  )
}
