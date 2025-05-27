"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface Jugador {
  id: string
  nombre: string
  apellido: string
  posicion: string
  fechaNacimiento: string
  numeroCamiseta: number
  pieHabil: string
  perfilHabil: string
  altura: number
  peso: number
  equipoActual: string
  golesMarcados: number
  tarjetasAmarillas: number
  tarjetasRojas: number
  partidosJugados: number
}

const JugadorDetailPage = ({ params }: { params: { id: string } }) => {
  const [jugador, setJugador] = useState<Jugador | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchJugador = async () => {
      try {
        const response = await fetch(`/api/staff/jugadores/${params.id}`)
        if (!response.ok) {
          router.push("/staff/jugadores")
          return
        }
        const data = await response.json()
        setJugador(data)
      } catch (error) {
        console.error("Error fetching jugador:", error)
        router.push("/staff/jugadores")
      }
    }

    fetchJugador()
  }, [params.id, router])

  if (!jugador) {
    return <div>Cargando...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Detalles del Jugador</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Información Personal</h2>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Nombre:</span>
            <span className="font-medium">{jugador.nombre}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Apellido:</span>
            <span className="font-medium">{jugador.apellido}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Fecha de Nacimiento:</span>
            <span className="font-medium">{new Date(jugador.fechaNacimiento).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Número de Camiseta:</span>
            <span className="font-medium">{jugador.numeroCamiseta}</span>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Información Deportiva</h2>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Posición:</span>
            <span className="font-medium">{jugador.posicion}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Perfil Hábil:</span>
            <span className="font-medium">
              {jugador.perfilHabil
                ? jugador.perfilHabil.charAt(0).toUpperCase() + jugador.perfilHabil.slice(1)
                : "No especificado"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Pie Hábil:</span>
            <span className="font-medium">{jugador.pieHabil}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Altura:</span>
            <span className="font-medium">{jugador.altura} cm</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Peso:</span>
            <span className="font-medium">{jugador.peso} kg</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Equipo Actual:</span>
            <span className="font-medium">{jugador.equipoActual}</span>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Estadísticas</h2>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Goles Marcados:</span>
            <span className="font-medium">{jugador.golesMarcados}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Tarjetas Amarillas:</span>
            <span className="font-medium">{jugador.tarjetasAmarillas}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Tarjetas Rojas:</span>
            <span className="font-medium">{jugador.tarjetasRojas}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Partidos Jugados:</span>
            <span className="font-medium">{jugador.partidosJugados}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JugadorDetailPage
