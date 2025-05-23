"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { agregarJugador, obtenerJugadores, eliminarJugador as eliminarJugadorFirebase } from "@/lib/firestoreHelpers"

export default function GestionJugadores() {
  const router = useRouter()
  const [jugadores, setJugadores] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

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
        const data = await obtenerJugadores()
        setJugadores(data)
        setError(null)
      } catch (err) {
        console.error("Error al cargar jugadores:", err)
        setError("No se pudieron cargar los jugadores. Error de permisos en Firebase.")
        // Crear datos de ejemplo para desarrollo
        setJugadores([
          {
            id: "ejemplo1",
            nombre: "Juan",
            apellido: "Pérez",
            fechaNacimiento: "1995-05-15",
            posicion: "Delantero",
            foto: null,
          },
          {
            id: "ejemplo2",
            nombre: "Carlos",
            apellido: "Rodríguez",
            fechaNacimiento: "1998-10-20",
            posicion: "Defensor",
            foto: null,
          },
        ])
      } finally {
        setCargando(false)
      }
    }
    cargar()
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

  // Guardar jugador sin volver a consultar la base
  const guardarJugador = async () => {
    if (!nombre || !apellido || !fechaNacimiento || !posicion) {
      alert("Por favor completa todos los campos")
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
      const docRef = await agregarJugador(nuevoJugador)

      setJugadores((prev) => [...prev, { id: docRef?.id || `temp-${Date.now()}`, ...nuevoJugador }])
      setError(null)

      // Reset formulario
      setNombre("")
      setApellido("")
      setFechaNacimiento("")
      setPosicion("")
      setFotoBase64(null)
      setMostrarFormulario(false)
    } catch (err) {
      console.error("Error al guardar jugador:", err)
      setError("No se pudo guardar el jugador. Error de permisos en Firebase.")

      // En modo desarrollo, simular éxito
      if (process.env.NODE_ENV === "development") {
        setJugadores((prev) => [...prev, { id: `temp-${Date.now()}`, ...nuevoJugador }])

        // Reset formulario
        setNombre("")
        setApellido("")
        setFechaNacimiento("")
        setPosicion("")
        setFotoBase64(null)
        setMostrarFormulario(false)
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
      } catch (err) {
        console.error("Error al eliminar jugador:", err)
        setError("No se pudo eliminar el jugador. Error de permisos en Firebase.")

        // En modo desarrollo, simular éxito
        if (process.env.NODE_ENV === "development") {
          setJugadores((prev) => prev.filter((j) => j.id !== id))
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-black text-gray-300 p-4">
      {/* Header - Maintaining the consistent header structure */}
      <div className="flex justify-between items-center mb-8">
        <Link href="/staff">
          <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
            Volver
          </Button>
        </Link>
        <div className="flex flex-col items-center">
          <div className="relative w-[50px] h-[60px] mb-2">
            <Image src="/penarol-white-bg.png" alt="Escudo Peñarol" fill className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-center text-yellow-400">Gestión de Jugadores</h1>
        </div>
        <div className="w-20"></div> {/* Spacer for alignment */}
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
          className="mb-6 bg-yellow-500 text-black hover:bg-yellow-400"
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
        >
          ➕ {mostrarFormulario ? "Cancelar" : "Crear nuevo jugador"}
        </Button>

        {mostrarFormulario && (
          <div className="bg-gray-800 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-yellow-400 mb-4">Nuevo Jugador</h2>
            <div className="grid gap-4">
              <Input
                placeholder="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="bg-gray-900 border-gray-700 text-white"
              />
              <Input
                placeholder="Apellido"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                className="bg-gray-900 border-gray-700 text-white"
              />
              <Input
                type="date"
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
                className="bg-gray-900 border-gray-700 text-white"
              />
              <Input
                placeholder="Posición"
                value={posicion}
                onChange={(e) => setPosicion(e.target.value)}
                className="bg-gray-900 border-gray-700 text-white"
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Foto del jugador</label>
                <input type="file" accept="image/*" onChange={manejarFoto} className="text-white w-full" />
                {fotoBase64 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-400 mb-1">Vista previa:</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={fotoBase64 || "/placeholder.svg"}
                      alt="Vista previa"
                      className="w-20 h-20 object-cover rounded-full border-2 border-yellow-500"
                    />
                  </div>
                )}
              </div>

              <Button className="mt-2 bg-green-600 hover:bg-green-700 text-white" onClick={guardarJugador}>
                Guardar Jugador
              </Button>
            </div>
          </div>
        )}

        <h2 className="text-xl font-semibold text-yellow-400 mb-4">Lista de Jugadores ({jugadores.length})</h2>

        {cargando ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Cargando jugadores...</p>
          </div>
        ) : jugadores.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No hay jugadores registrados</p>
            <p className="text-sm">Haz clic en "Crear nuevo jugador" para agregar el primero</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jugadores.map((jugador) => (
              <div
                key={jugador.id}
                className="bg-gray-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-gray-700 transition"
              >
                <div className="flex items-center gap-4">
                  {jugador.foto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={jugador.foto || "/placeholder.svg"}
                      alt={`${jugador.nombre} ${jugador.apellido}`}
                      className="w-12 h-12 rounded-full object-cover border-2 border-yellow-500"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold uppercase">
                      {jugador.nombre[0]}
                      {jugador.apellido[0]}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-white">
                      {jugador.nombre} {jugador.apellido}
                    </h3>
                    <p className="text-gray-400">
                      {jugador.posicion} • Nacido: {jugador.fechaNacimiento}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 self-end sm:self-auto">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/staff/jugadores/${jugador.id}`)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-600"
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
      </div>
    </div>
  )
}
