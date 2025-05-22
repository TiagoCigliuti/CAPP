"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

const opcionesIniciales = [
  "Activación",
  "Rondo",
  "Juego de posesión",
  "Juego de posición",
  "Juego de progresión",
  "Juego de situación",
  "Duelos",
  "Fútbol reducido",
  "Fútbol modificado",
  "Fútbol interno",
  "Fútbol intercategorías",
  "ABP",
  "Táctico",
  "Progresiones ofensivas",
  "Específico",
]

export default function TareasCanchaPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [nombre, setNombre] = useState("")
  const [tipo, setTipo] = useState("")
  const [nuevaOpcion, setNuevaOpcion] = useState("")
  const [opciones, setOpciones] = useState(opcionesIniciales)
  const [jugadores, setJugadores] = useState("")
  const [espacio, setEspacio] = useState("")
  const [imagen, setImagen] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  // Cargar tareas guardadas al iniciar
  useEffect(() => {
    const savedTasks = localStorage.getItem("tareas-cancha")
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks))
      } catch (error) {
        console.error("Error loading saved tasks:", error)
      }
    }
  }, [])

  useEffect(() => {
    if (imagen) {
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result as string)
      reader.readAsDataURL(imagen)
    } else {
      setPreview(null)
    }
  }, [imagen])

  const handleAddTipo = () => {
    if (nuevaOpcion && !opciones.includes(nuevaOpcion)) {
      setOpciones([...opciones, nuevaOpcion])
      setTipo(nuevaOpcion)
      setNuevaOpcion("")
    }
  }

  const handleGuardar = () => {
    if (!nombre || !tipo) return

    const nuevaTarea = {
      nombre,
      tipo,
      jugadores,
      espacio,
      imagen: preview,
    }

    const actualizado = [...tasks, nuevaTarea]
    setTasks(actualizado)
    localStorage.setItem("tareas-cancha", JSON.stringify(actualizado))

    // reset
    setNombre("")
    setTipo("")
    setJugadores("")
    setEspacio("")
    setImagen(null)
    setPreview(null)
  }

  return (
    <div className="min-h-screen bg-black text-gray-300 p-4">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <Link href="/staff/entrenamientos/gestion">
          <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
            Volver
          </Button>
        </Link>
        <div className="flex flex-col items-center">
          <div className="relative w-[80px] h-[100px] mb-2">
            <Image src="/penarol-white-bg.png" alt="Escudo Peñarol" fill className="object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-yellow-400 text-center">Tareas de Cancha</h1>
        </div>
        <div className="w-20" />
      </div>

      <div className="grid gap-4 max-w-xl mx-auto bg-gray-800 p-6 rounded-xl mb-8">
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre de la tarea"
          className="w-full p-2 rounded bg-gray-900 text-white"
        />

        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="w-full p-2 rounded bg-gray-900 text-white"
        >
          <option value="">Seleccionar tipo de tarea</option>
          {opciones.map((op, i) => (
            <option key={i} value={op}>
              {op}
            </option>
          ))}
          <option value="otra">Otra...</option>
        </select>

        {tipo === "otra" && (
          <div className="flex gap-2">
            <input
              type="text"
              value={nuevaOpcion}
              onChange={(e) => setNuevaOpcion(e.target.value)}
              placeholder="Nuevo tipo"
              className="flex-1 p-2 rounded bg-gray-900 text-white"
            />
            <Button onClick={handleAddTipo} className="bg-yellow-500 text-black hover:bg-yellow-400">
              Agregar
            </Button>
          </div>
        )}

        <input
          type="text"
          value={jugadores}
          onChange={(e) => setJugadores(e.target.value)}
          placeholder="Cantidad de jugadores"
          className="w-full p-2 rounded bg-gray-900 text-white"
        />

        <input
          type="text"
          value={espacio}
          onChange={(e) => setEspacio(e.target.value)}
          placeholder="Espacio utilizado"
          className="w-full p-2 rounded bg-gray-900 text-white"
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImagen(e.target.files?.[0] || null)}
          className="w-full p-2 rounded bg-gray-900 text-white"
        />

        {preview && (
          <img
            src={preview || "/placeholder.svg"}
            alt="Previsualización"
            className="rounded w-full object-contain max-h-64 mt-2"
          />
        )}

        <Button onClick={handleGuardar} className="w-full bg-yellow-500 text-black hover:bg-yellow-400">
          Guardar tarea
        </Button>
      </div>

      {/* Lista de tareas cargadas */}
      <div className="max-w-xl mx-auto">
        <h2 className="text-xl font-bold mb-4 text-yellow-400">Tareas guardadas</h2>
        {tasks.length === 0 && <p className="text-gray-400 italic">Aún no hay tareas cargadas</p>}
        {tasks.map((t, i) => (
          <div key={i} className="bg-gray-700 p-4 rounded mb-4">
            <h3 className="text-lg font-semibold text-white">{t.nombre}</h3>
            <p className="text-sm">
              Tipo: <span className="text-yellow-300">{t.tipo}</span>
            </p>
            <p className="text-sm">Jugadores: {t.jugadores}</p>
            <p className="text-sm">Espacio: {t.espacio}</p>
            {t.imagen && (
              <img src={t.imagen || "/placeholder.svg"} alt="imagen" className="mt-2 rounded max-h-40 object-contain" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
