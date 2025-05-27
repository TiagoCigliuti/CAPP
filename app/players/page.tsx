"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { obtenerJugadores } from "@/lib/firestoreHelpers"
import { Button } from "@/components/ui/button"
import { getCurrentUser, getCurrentClient } from "@/lib/users"
import { useTheme } from "@/hooks/useTheme"
import Link from "next/link"

export default function PlayersPage() {
  const router = useRouter()
  const [jugadores, setJugadores] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [currentClient, setCurrentClient] = useState<any>(null)

  // Usar el hook useTheme para obtener el tema actual
  const { theme, currentClient: clientFromTheme } = useTheme()

  // Crear un tema seguro con valores por defecto
  const safeTheme = {
    bgColor: theme?.bgColor || "bg-white",
    textColor: theme?.textColor || "text-gray-900",
    cardBg: theme?.cardBg || "bg-white",
    borderColor: theme?.borderColor || "border-gray-200",
    primaryColor: theme?.primaryColor || "bg-blue-600",
  }

  useEffect(() => {
    async function cargarJugadores() {
      try {
        const user = getCurrentUser()
        if (!user) {
          router.push("/")
          return
        }

        const client = await getCurrentClient()
        setCurrentClient(client)

        if (client) {
          // Cargar jugadores del cliente actual
          const data = await obtenerJugadores(client.id)
          setJugadores(data)
        } else {
          console.error("No se pudo identificar el cliente actual")
          setJugadores([])
        }
      } catch (error) {
        console.error("Error al cargar jugadores:", error)
        setJugadores([])
      } finally {
        setCargando(false)
      }
    }

    cargarJugadores()
  }, [router])

  const handleClick = (id: string) => {
    router.push(`/player/${id}`)
  }

  // Usar el cliente del hook si está disponible, sino el del estado
  const displayClient = clientFromTheme || currentClient

  return (
    <div className={`min-h-screen ${safeTheme.bgColor} ${safeTheme.textColor} p-4`}>
      <div className="flex justify-between items-center mb-8">
        <Link href="/staff">
          <Button variant="outline" className={`${safeTheme.borderColor} ${safeTheme.textColor} hover:bg-gray-100`}>
            Volver
          </Button>
        </Link>
        <div className="flex flex-col items-center">
          {/* Logo del cliente o iniciales */}
          {displayClient?.logo ? (
            <div className="w-16 h-16 mb-2">
              <img
                src={displayClient.logo || "/placeholder.svg"}
                alt={`Logo ${displayClient.clubName || displayClient.name}`}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-2">
              <span className="text-white text-xl font-bold">
                {displayClient?.clubName
                  ? displayClient.clubName
                      .split(" ")
                      .map((word: string) => word[0])
                      .join("")
                      .slice(0, 2)
                  : "SD"}
              </span>
            </div>
          )}
          <h1 className={`text-2xl font-bold text-center ${safeTheme.textColor}`}>Selecciona tu perfil</h1>
          {displayClient && (
            <p className="text-sm text-gray-600 mt-1">{displayClient.clubName || displayClient.name}</p>
          )}
        </div>
        <div className="w-20"></div>
      </div>

      {cargando ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando jugadores...</p>
        </div>
      ) : jugadores.length === 0 ? (
        <div className="text-center py-12 max-w-md mx-auto">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-gray-500 text-3xl">👥</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">No hay jugadores registrados</h2>
          <p className="text-gray-500 mb-6">
            Aún no hay jugadores en el sistema. Contacta al staff para que agreguen jugadores, o accede al panel de
            staff para crear jugadores.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              <strong>💡 Sugerencia:</strong> Contacta al staff para que agreguen jugadores al sistema.
            </p>
          </div>
          <div className="mt-6">
            <Link href="/staff">
              <Button className={`${safeTheme.primaryColor} text-white`}>Ir al Panel de Staff</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {jugadores.map((jugador) => (
            <div
              key={jugador.id}
              onClick={() => handleClick(jugador.id)}
              className={`${safeTheme.cardBg} border ${safeTheme.borderColor} rounded-xl p-4 flex flex-col items-center cursor-pointer hover:shadow-md transition`}
            >
              {jugador.foto ? (
                <div className="relative w-20 h-20 mb-2">
                  <img
                    src={jugador.foto || "/placeholder.svg"}
                    alt={`${jugador.nombre} ${jugador.apellido}`}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-2">
                  {jugador.nombre?.[0] || ""}
                  {jugador.apellido?.[0] || ""}
                </div>
              )}
              <span className={`text-sm font-medium text-center ${safeTheme.textColor}`}>
                {jugador.nombre || ""} {jugador.apellido || ""}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
