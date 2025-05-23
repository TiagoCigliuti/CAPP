"use client"

import type React from "react"

import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { obtenerJugador, actualizarJugador } from "@/lib/firestoreHelpers"

export default function PerfilJugador() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [jugador, setJugador] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadPlayer()
  }, [id])

  const loadPlayer = async () => {
    try {
      setLoading(true)
      // Check if it's a temp ID (from development mode)
      if (id.startsWith("temp-") || id.startsWith("ejemplo")) {
        // Create mock data for development
        setJugador({
          id,
          nombre: id.startsWith("ejemplo") ? (id === "ejemplo1" ? "Juan" : "Carlos") : "Jugador",
          apellido: id.startsWith("ejemplo") ? (id === "ejemplo1" ? "Pérez" : "Rodríguez") : "Temporal",
          fechaNacimiento: "2000-01-01",
          posicion: "No especificada",
          foto: null,
        })
        setError("Mostrando datos simulados debido a problemas de permisos con Firebase.")
      } else {
        const player = await obtenerJugador(id)
        setJugador(player)
        setError(null)
      }
    } catch (err) {
      console.error("Error loading player:", err)
      setError("No se pudo cargar la información del jugador. Error de permisos en Firebase.")

      // Create mock data for development
      setJugador({
        id,
        nombre: "Jugador",
        apellido: "No Disponible",
        fechaNacimiento: "2000-01-01",
        posicion: "No especificada",
        foto: null,
      })
    } finally {
      setLoading(false)
    }
  }

  const manejarFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0]
    if (!archivo || !jugador?.id) return

    try {
      setUploading(true)

      // Convert file to base64
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = reader.result as string

        try {
          await actualizarJugador(jugador.id, { foto: base64 })
          setError(null)
        } catch (err) {
          console.error("Error updating photo:", err)
          setError("No se pudo actualizar la foto en Firebase. Error de permisos.")
        }

        // Update local state regardless of Firebase success
        setJugador({
          ...jugador,
          foto: base64,
        })

        setUploading(false)
      }
      reader.readAsDataURL(archivo)
    } catch (err) {
      console.error("Error processing photo:", err)
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-gray-300 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p>Cargando información del jugador...</p>
        </div>
      </div>
    )
  }

  if (!jugador) {
    return (
      <div className="min-h-screen bg-black text-gray-300 p-4">
        <div className="max-w-xl mx-auto bg-gray-800 rounded-xl p-6 text-center">
          <h1 className="text-2xl font-bold text-yellow-400 mb-4">Jugador no encontrado</h1>
          <p className="mb-6">No se encontró información para el jugador solicitado.</p>
          <Link href="/staff/jugadores">
            <Button className="bg-yellow-500 text-black hover:bg-yellow-400">← Volver a Gestión de Jugadores</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-gray-300 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <Link href="/staff/jugadores">
          <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
            ← Volver
          </Button>
        </Link>
        <div className="flex flex-col items-center">
          <div className="relative w-[50px] h-[60px] mb-2">
            <Image src="/penarol-white-bg.png" alt="Escudo Peñarol" fill className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-center text-yellow-400">Perfil del Jugador</h1>
        </div>
        <div className="w-20"></div> {/* Spacer for alignment */}
      </div>

      <div className="max-w-2xl mx-auto">
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-white p-4 rounded-lg mb-4">
            <p>{error}</p>
          </div>
        )}

        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            {/* Photo section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-yellow-500">
                {jugador.foto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={jugador.foto || "/placeholder.svg"}
                    alt="Foto del jugador"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center text-4xl font-bold text-yellow-400">
                    {jugador.nombre.charAt(0)}
                    {jugador.apellido.charAt(0)}
                  </div>
                )}
              </div>
              <label className="cursor-pointer">
                <span className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md text-sm inline-block">
                  {uploading ? "Subiendo..." : jugador.foto ? "Cambiar foto" : "Subir foto"}
                </span>
                <input type="file" accept="image/*" onChange={manejarFoto} className="hidden" disabled={uploading} />
              </label>
            </div>

            {/* Player info */}
            <div className="flex-1 space-y-4">
              <h2 className="text-2xl font-bold text-white">
                {jugador.nombre} {jugador.apellido}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700 p-3 rounded-lg">
                  <p className="text-sm text-gray-400">Posición</p>
                  <p className="text-lg font-semibold">{jugador.posicion}</p>
                </div>

                <div className="bg-gray-700 p-3 rounded-lg">
                  <p className="text-sm text-gray-400">Fecha de nacimiento</p>
                  <p className="text-lg font-semibold">{jugador.fechaNacimiento}</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-700">
                <h3 className="text-lg font-semibold text-yellow-400 mb-4">Estadísticas del jugador</h3>
                <p className="text-gray-400 italic">No hay estadísticas disponibles para este jugador.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
