"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { agregarJugador, obtenerJugadores, eliminarJugador as eliminarJugadorFirebase } from "@/lib/firestoreHelpers"
import { clubThemes, getCurrentTheme } from "@/lib/themes"
import { getCurrentUser, getCurrentClient } from "@/lib/users"

export default function GestionJugadores() {
  const router = useRouter()
  const [jugadores, setJugadores] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [theme, setTheme] = useState(clubThemes.default)
  const [currentClient, setCurrentClient] = useState<any>(null)

  // Formulario
  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [fechaNacimiento, setFechaNacimiento] = useState("")
  const [posicion, setPosicion] = useState("")
  const [fotoBase64, setFotoBase64] = useState<string | null>(null)

  // Cargar jugadores desde Firestore al inicio
  useEffect(() => {
    async function cargar() {
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
          setError(null)
        } else {
          setError("No se pudo identificar el cliente actual")
          setJugadores([])
        }
      } catch (err) {
        console.error("Error al cargar jugadores:", err)
        setError("No se pudieron cargar los jugadores. Error de permisos en Firebase.")
        setJugadores([])
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [router])

  useEffect(() => {
    const currentTheme = getCurrentTheme()
    setTheme(clubThemes[currentTheme])
  }, [])

  // Manejar carga de imagen
  const manejarFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0]
    if (archivo) {
      const lector = new FileReader()
      lector.onload = () => {
        setFotoBase64(lector.result as string)
      }
      lector.readAsDataURL(archivo)
    }
  }

  // Guardar jugador
  const guardarJugador = async () => {
    if (!nombre || !apellido || !fechaNacimiento || !posicion) {
      alert("Por favor completa todos los campos")
      return
    }

    if (!currentClient) {
      alert("Error: No se pudo identificar el cliente")
      return
    }

    const nuevoJugador = {
      nombre,
      apellido,
      fechaNacimiento,
      posicion,
      foto: fotoBase64,
    }

    try {
      const docRef = await agregarJugador(nuevoJugador, currentClient.id)

      setJugadores((prev) => [
        ...prev,
        { id: docRef?.id || `temp-${Date.now()}`, ...nuevoJugador, clientId: currentClient.id },
      ])
      setError(null)

      // Reset formulario
      setNombre("")
      setApellido("")
      setFechaNacimiento("")
      setPosicion("")
      setFotoBase64(null)
      setMostrarFormulario(false)

      alert("Jugador creado exitosamente")
    } catch (err) {
      console.error("Error al guardar jugador:", err)
      setError("No se pudo guardar el jugador. Error de permisos en Firebase.")

      // En modo desarrollo, simular éxito
      if (process.env.NODE_ENV === "development") {
        setJugadores((prev) => [...prev, { id: `temp-${Date.now()}`, ...nuevoJugador, clientId: currentClient.id }])

        // Reset formulario
        setNombre("")
        setApellido("")
        setFechaNacimiento("")
        setPosicion("")
        setFotoBase64(null)
        setMostrarFormulario(false)

        alert("Jugador creado exitosamente (modo desarrollo)")
      }
    }
  }

  // Eliminar jugador y actualizar estado local
  const eliminarJugador = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este jugador?")) {
      try {
        await eliminarJugadorFirebase(id)
        setJugadores((prev) => prev.filter((j) => j.id !== id))
        setError(null)
        alert("Jugador eliminado exitosamente")
      } catch (err) {
        console.error("Error al eliminar jugador:", err)
        setError("No se pudo eliminar el jugador. Error de permisos en Firebase.")

        // En modo desarrollo, simular éxito
        if (process.env.NODE_ENV === "development") {
          setJugadores((prev) => prev.filter((j) => j.id !== id))
          alert("Jugador eliminado exitosamente (modo desarrollo)")
        }
      }
    }
  }

  return (
    <div className={`min-h-screen ${theme.bgColor} ${theme.textColor} p-4`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <Link href="/staff">
          <Button variant="outline" className={`${theme.borderColor} ${theme.textColor} hover:bg-gray-100`}>
            Volver
          </Button>
        </Link>
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-2">
            <span className="text-white text-xl font-bold">SD</span>
          </div>
          <h1 className={`text-2xl font-bold text-center ${theme.textColor}`}>Gestión de Jugadores</h1>
          {currentClient && <p className="text-sm text-gray-600 mt-1">Cliente: {currentClient.name}</p>}
        </div>
        <div className="w-20"></div>
      </div>

      <div className="max-w-4xl mx-auto">
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-white p-4 rounded-lg mb-4">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
            <p className="text-sm mt-2 text-gray-300">
              Nota: La aplicación está funcionando en modo simulado debido a problemas de permisos con Firebase.
            </p>
          </div>
        )}

        <Button
          className={`mb-6 ${theme.primaryColor} text-white`}
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
        >
          ➕ {mostrarFormulario ? "Cancelar" : "Crear nuevo jugador"}
        </Button>

        {mostrarFormulario && (
          <div className={`${theme.cardBg} border ${theme.borderColor} rounded-xl p-6 mb-6`}>
            <h2 className={`text-lg font-semibold ${theme.textColor} mb-4`}>Nuevo Jugador</h2>
            <div className="grid gap-4">
              <Input
                placeholder="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className={`bg-white border ${theme.borderColor} text-gray-900`}
              />
              <Input
                placeholder="Apellido"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                className={`bg-white border ${theme.borderColor} text-gray-900`}
              />
              <Input
                type="date"
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
                className={`bg-white border ${theme.borderColor} text-gray-900`}
              />
              <Input
                placeholder="Posición"
                value={posicion}
                onChange={(e) => setPosicion(e.target.value)}
                className={`bg-white border ${theme.borderColor} text-gray-900`}
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Foto del jugador</label>
                <input type="file" accept="image/*" onChange={manejarFoto} className="text-gray-700 w-full" />
                {fotoBase64 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-1">Vista previa:</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={fotoBase64 || "/placeholder.svg"}
                      alt="Vista previa"
                      className="w-20 h-20 object-cover rounded-full border-2 border-blue-500"
                    />
                  </div>
                )}
              </div>

              <Button className={`mt-2 ${theme.primaryColor} text-white`} onClick={guardarJugador}>
                Guardar Jugador
              </Button>
            </div>
          </div>
        )}

        <h2 className="text-xl font-semibold text-gray-700 mb-4">Jugadores del Cliente ({jugadores.length})</h2>

        {cargando ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando jugadores...</p>
          </div>
        ) : jugadores.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-500 text-2xl">👥</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay jugadores registrados</h3>
            <p className="text-gray-500 mb-4">
              Aún no hay jugadores en el sistema. Puedes crear y gestionar jugadores desde aquí.
            </p>
            <Button className={`${theme.primaryColor} text-white`} onClick={() => setMostrarFormulario(true)}>
              Crear primer jugador
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {jugadores.map((jugador) => (
              <div
                key={jugador.id}
                className={`${theme.cardBg} border ${theme.borderColor} p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:shadow-md transition`}
              >
                <div className="flex items-center gap-4">
                  {jugador.foto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={jugador.foto || "/placeholder.svg"}
                      alt={`${jugador.nombre} ${jugador.apellido}`}
                      className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold uppercase">
                      {jugador.nombre[0]}
                      {jugador.apellido[0]}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {jugador.nombre} {jugador.apellido}
                    </h3>
                    <p className="text-gray-600">
                      {jugador.posicion} • Nacido: {jugador.fechaNacimiento}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 self-end sm:self-auto">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/staff/jugadores/${jugador.id}`)}
                    className="border-gray-400 text-gray-700 hover:bg-gray-100"
                  >
                    Ver Datos
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => eliminarJugador(jugador.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Información sobre gestión compartida */}
        {currentClient && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Gestión Compartida</h3>
            <p className="text-blue-800 text-sm">
              Todos los miembros del equipo pueden crear, editar y visualizar estos jugadores. Los jugadores creados
              aquí estarán disponibles para todo el staff.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
