"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { obtenerJugadores } from "@/lib/firestoreHelpers"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { clubThemes, getCurrentTheme } from "@/lib/themes"

export default function PlayersPage() {
  const router = useRouter()
  const [jugadores, setJugadores] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [theme, setTheme] = useState(clubThemes.default)

  useEffect(() => {
    const currentTheme = getCurrentTheme()
    setTheme(clubThemes[currentTheme])
  }, [])

  useEffect(() => {
    async function cargarJugadores() {
      try {
        const data = await obtenerJugadores()
        setJugadores(data)
      } catch (error) {
        console.error("Error al cargar jugadores:", error)
        setJugadores(
          Array.from({ length: 10 }, (_, i) => ({
            id: `jugador-${i + 1}`,
            nombre: `Jugador`,
            apellido: `${i + 1}`,
            foto: null,
          })),
        )
      } finally {
        setCargando(false)
      }
    }

    cargarJugadores()
  }, [])

  const handleClick = (id: string) => {
    router.push(`/player/${id}`)
  }

  return (
    <div className={`min-h-screen ${theme.bgColor} ${theme.textColor} p-4`}>
      <div className="flex justify-between items-center mb-8">
        <Link href="/">
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
          <h1 className={`text-2xl font-bold text-center ${theme.textColor}`}>Selecciona tu perfil</h1>
        </div>
        <div className="w-20"></div>
      </div>

      {cargando ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando jugadores...</p>
        </div>
      ) : jugadores.length === 0 ? (
        <p className="text-center text-gray-500">No hay jugadores cargados aún.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {jugadores.map((jugador) => (
            <div
              key={jugador.id}
              onClick={() => handleClick(jugador.id)}
              className={`${theme.cardBg} border ${theme.borderColor} rounded-xl p-4 flex flex-col items-center cursor-pointer hover:shadow-md transition`}
            >
              {jugador.foto ? (
                <div className="relative w-20 h-20 mb-2">
                  <Image
                    src={jugador.foto || "/placeholder.svg"}
                    alt={`${jugador.nombre} ${jugador.apellido}`}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-2">
                  {jugador.nombre[0]}
                  {jugador.apellido[0]}
                </div>
              )}
              <span className={`text-sm font-medium text-center ${theme.textColor}`}>
                {jugador.nombre} {jugador.apellido}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
