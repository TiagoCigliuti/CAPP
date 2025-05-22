"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

type Tarea = {
  nombre: string
  tipo: string
}

type TareaSesion = {
  nombre: string
  bloques: number
  duracionBloque: number
  pausa: number
  duracionTotal: number
}

export default function PlanificacionCanchaPage() {
  const [fecha, setFecha] = useState<Date | null>(new Date())
  const [horaInicio, setHoraInicio] = useState("")
  const [tareasDisponibles, setTareasDisponibles] = useState<Tarea[]>([])
  const [tipoSeleccionado, setTipoSeleccionado] = useState("")
  const [tareaActual, setTareaActual] = useState("")
  const [tareasSeleccionadas, setTareasSeleccionadas] = useState<TareaSesion[]>([])
  const [bloques, setBloques] = useState(1)
  const [duracionBloque, setDuracionBloque] = useState(1)
  const [pausa, setPausa] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem("tareas-cancha")
    if (stored) {
      setTareasDisponibles(JSON.parse(stored))
    }
  }, [])

  const tiposUnicos = [...new Set(tareasDisponibles.map((t) => t.tipo))]
  const tareasFiltradas = tareasDisponibles.filter((t) => t.tipo === tipoSeleccionado)

  const calcularDuracionTotal = (bloques: number, duracion: number, pausa: number) => {
    if (bloques <= 0 || duracion <= 0) return 0
    return bloques * duracion + (bloques - 1) * pausa
  }

  const handleBloqueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? 1 : Math.max(1, Number.parseInt(e.target.value) || 1)
    setBloques(value)
  }

  const handleDuracionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? 1 : Math.max(1, Number.parseInt(e.target.value) || 1)
    setDuracionBloque(value)
  }

  const handlePausaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? 0 : Math.max(0, Number.parseInt(e.target.value) || 0)
    setPausa(value)
  }

  const agregarTarea = () => {
    if (!tareaActual) return

    const duracionTotal = calcularDuracionTotal(bloques, duracionBloque, pausa)

    const nueva: TareaSesion = {
      nombre: tareaActual,
      bloques,
      duracionBloque,
      pausa,
      duracionTotal,
    }

    setTareasSeleccionadas([...tareasSeleccionadas, nueva])
    setTareaActual("")
    setBloques(1)
    setDuracionBloque(1)
    setPausa(0)
  }

  const eliminarTarea = (index: number) => {
    const actualizado = [...tareasSeleccionadas]
    actualizado.splice(index, 1)
    setTareasSeleccionadas(actualizado)
  }

  const guardarSesion = () => {
    if (!fecha || !horaInicio || tareasSeleccionadas.length === 0) return

    const fechaStr = fecha.toISOString().split("T")[0]

    const sesion = {
      fecha: fechaStr,
      horaInicio,
      tareas: tareasSeleccionadas,
    }

    const sesionesGuardadas = JSON.parse(localStorage.getItem("sesiones-cancha") || "[]")
    const nuevasSesiones = [...sesionesGuardadas, sesion]
    localStorage.setItem("sesiones-cancha", JSON.stringify(nuevasSesiones))

    const calendario = JSON.parse(localStorage.getItem("semana-actividades") || "{}")
    const resumen = `Sesión de cancha (${tareasSeleccionadas.length} tareas)`
    calendario[fechaStr] = [...(calendario[fechaStr] || []), { time: horaInicio, activity: resumen }]
    localStorage.setItem("semana-actividades", JSON.stringify(calendario))

    // Reset
    setFecha(new Date())
    setHoraInicio("")
    setTipoSeleccionado("")
    setTareaActual("")
    setTareasSeleccionadas([])
    setBloques(1)
    setDuracionBloque(1)
    setPausa(0)
    router.push("/staff/entrenamientos/planificacion")
  }

  return (
    <div className="min-h-screen bg-black text-gray-300 p-4">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <Link href="/staff/entrenamientos/planificacion">
          <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
            Volver
          </Button>
        </Link>
        <div className="flex flex-col items-center">
          <div className="relative w-[80px] h-[100px] mb-2">
            <Image src="/penarol-white-bg.png" alt="Escudo Peñarol" fill className="object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-yellow-400 text-center">Crear Sesión de Cancha</h1>
        </div>
        <div className="w-20" />
      </div>

      <div className="grid gap-4 max-w-xl mx-auto bg-gray-800 p-6 rounded-xl mb-8">
        <label className="text-sm text-gray-300">Fecha de la sesión</label>
        <DatePicker
          selected={fecha}
          onChange={(date) => setFecha(date)}
          dateFormat="yyyy-MM-dd"
          className="w-full p-2 rounded bg-gray-900 text-white"
        />

        <label className="text-sm text-gray-300">Horario de inicio</label>
        <input
          type="time"
          value={horaInicio}
          onChange={(e) => setHoraInicio(e.target.value)}
          className="w-full p-2 rounded bg-gray-900 text-white"
        />

        <label className="text-sm text-gray-300">Tipo de tarea</label>
        <select
          value={tipoSeleccionado}
          onChange={(e) => {
            setTipoSeleccionado(e.target.value)
            setTareaActual("")
          }}
          className="w-full p-2 rounded bg-gray-900 text-white"
        >
          <option value="">Seleccionar tipo</option>
          {tiposUnicos.map((tipo, i) => (
            <option key={i} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>

        {tipoSeleccionado && (
          <>
            <label className="text-sm text-gray-300">Tarea</label>
            <select
              value={tareaActual}
              onChange={(e) => setTareaActual(e.target.value)}
              className="w-full p-2 rounded bg-gray-900 text-white"
            >
              <option value="">Seleccionar tarea</option>
              {tareasFiltradas.map((t, i) => (
                <option key={i} value={t.nombre}>
                  {t.nombre}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm">Bloques</label>
                <input
                  type="number"
                  min={1}
                  value={bloques}
                  onChange={handleBloqueChange}
                  className="w-full p-2 rounded bg-gray-900 text-white"
                />
              </div>
              <div>
                <label className="text-sm">Min/bloque</label>
                <input
                  type="number"
                  min={1}
                  value={duracionBloque}
                  onChange={handleDuracionChange}
                  className="w-full p-2 rounded bg-gray-900 text-white"
                />
              </div>
              <div>
                <label className="text-sm">Min/pausa</label>
                <input
                  type="number"
                  min={0}
                  value={pausa}
                  onChange={handlePausaChange}
                  className="w-full p-2 rounded bg-gray-900 text-white"
                />
              </div>
            </div>

            <p className="text-sm text-gray-400">
              Duración total: {calcularDuracionTotal(bloques, duracionBloque, pausa)} minutos
            </p>

            <Button onClick={agregarTarea} className="w-full bg-yellow-500 text-black hover:bg-yellow-400 mt-2">
              Agregar tarea
            </Button>
          </>
        )}

        {tareasSeleccionadas.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-yellow-400 mt-4 mb-2">Tareas en la sesión</h2>
            <ul className="space-y-2">
              {tareasSeleccionadas.map((t, i) => (
                <li key={i} className="bg-gray-700 p-3 rounded">
                  <div className="flex justify-between">
                    <strong>
                      Tarea {i + 1}: {t.nombre}
                    </strong>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => eliminarTarea(i)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Eliminar
                    </Button>
                  </div>
                  <p className="text-sm">
                    Bloques: {t.bloques}, Duración/bloque: {t.duracionBloque} min, Pausa: {t.pausa} min
                  </p>
                  <p className="text-sm text-yellow-300">Duración total: {t.duracionTotal} minutos</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button onClick={guardarSesion} className="w-full bg-yellow-500 text-black hover:bg-yellow-400 mt-4">
          Guardar sesión
        </Button>
      </div>
    </div>
  )
}
