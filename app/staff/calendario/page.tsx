"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  startOfWeek,
  addDays,
  format,
  subWeeks,
  addWeeks
} from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"

type Activity = { time: string; activity: string }

const actividadSugeridas = [
  "Desayuno",
  "Gimnasio",
  "Entrenamiento técnico",
  "Evaluación",
  "Partido",
  "Libre"
]

export default function CalendarioSemanal() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [weekDates, setWeekDates] = useState<Date[]>([])
  const [schedule, setSchedule] = useState<Record<string, Activity[]>>({})
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [newTime, setNewTime] = useState("")
  const [newActivity, setNewActivity] = useState("")
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    generateWeek(currentDate)

    const stored = localStorage.getItem("semana-actividades")
    if (stored) {
      setSchedule(JSON.parse(stored))
    }
  }, [currentDate])

  const generateWeek = (baseDate: Date) => {
    const start = startOfWeek(baseDate, { weekStartsOn: 1 })
    const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))
    setWeekDates(days)
  }

  const handleAddActivity = () => {
    if (!selectedDate || !newTime || !newActivity) return

    const updated = {
      ...schedule,
      [selectedDate]: [
        ...(schedule[selectedDate] || []),
        { time: newTime, activity: newActivity }
      ].sort((a, b) => a.time.localeCompare(b.time))
    }

    setSchedule(updated)
    localStorage.setItem("semana-actividades", JSON.stringify(updated))
    setNewTime("")
    setNewActivity("")
    setEditIndex(null)
  }

  const handleDelete = (dateKey: string, index: number) => {
    const updated = { ...schedule }
    updated[dateKey].splice(index, 1)
    setSchedule(updated)
    localStorage.setItem("semana-actividades", JSON.stringify(updated))
  }

  const handleEdit = (dateKey: string, index: number) => {
    const item = schedule[dateKey][index]
    setSelectedDate(dateKey)
    setNewTime(item.time)
    setNewActivity(item.activity)
    setEditIndex(index)
  }

  const handleUpdateActivity = () => {
    if (editIndex === null || !selectedDate) return
    const updated = { ...schedule }
    updated[selectedDate][editIndex] = { time: newTime, activity: newActivity }
    updated[selectedDate].sort((a, b) => a.time.localeCompare(b.time))

    setSchedule(updated)
    localStorage.setItem("semana-actividades", JSON.stringify(updated))
    setNewTime("")
    setNewActivity("")
    setEditIndex(null)
  }

  const weekRange = weekDates.length
    ? `Semana del ${format(weekDates[0], "dd 'de' MMMM", { locale: es })} al ${format(weekDates[6], "dd 'de' MMMM", { locale: es })}`
    : ""

  return (
    <div
      className="min-h-screen bg-black text-white p-6"
      onClick={() => setSelectedDate("")}
    >
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <Button
          onClick={() => router.push("/staff")}
          variant="outline"
          className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          Volver al menú
        </Button>
        <h1 className="text-2xl text-yellow-400 font-bold text-center flex-1">
          {weekRange}
        </h1>
        <div className="flex gap-2">
          <Button onClick={() => setCurrentDate(subWeeks(currentDate, 1))}>
            ← Semana anterior
          </Button>
          <Button onClick={() => setCurrentDate(addWeeks(currentDate, 1))}>
            Semana siguiente →
          </Button>
        </div>
      </div>

      {/* Calendario */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {weekDates.map((date) => {
          const key = date.toISOString().split("T")[0]
          const actividades = schedule[key] || []

          return (
            <div
              key={key}
              className={`bg-gray-800 rounded-xl p-4 border relative ${
                selectedDate === key ? "border-yellow-400" : "border-transparent"
              }`}
              onClick={(e) => {
                e.stopPropagation()
                setSelectedDate(key)
              }}
            >
              <h2 className="text-lg font-semibold text-yellow-400 mb-2">
                {format(date, "EEEE dd/MM", { locale: es })}
              </h2>

              {/* Actividades */}
              <ul className="mb-3 space-y-1">
                {actividades.length === 0 && (
                  <li className="text-gray-400 italic">Sin actividades</li>
                )}
                {actividades.map((item, idx) => (
                  <li key={idx} className="text-sm flex justify-between items-center gap-2">
                    <span>
                      <span className="text-yellow-300 font-mono">{item.time}</span> - {item.activity}
                    </span>
                    <div className="flex gap-2">
                      <Pencil
                        size={16}
                        className="cursor-pointer text-blue-400 hover:text-blue-300"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(key, idx)
                        }}
                      />
                      <Trash2
                        size={16}
                        className="cursor-pointer text-red-500 hover:text-red-400"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(key, idx)
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>

              {/* Formulario */}
              {selectedDate === key && (
                <div className="space-y-2">
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-gray-900 text-white p-2 rounded"
                  />
                  <select
                    value={newActivity}
                    onChange={(e) => setNewActivity(e.target.value)}
                    className="w-full bg-gray-900 text-white p-2 rounded"
                  >
                    <option value="">Seleccionar actividad</option>
                    {actividadSugeridas.map((op, i) => (
                      <option key={i} value={op}>{op}</option>
                    ))}
                    <option value="custom">Otra...</option>
                  </select>
                  {newActivity === "custom" && (
                    <input
                      type="text"
                      placeholder="Otra actividad..."
                      onChange={(e) => setNewActivity(e.target.value)}
                      className="w-full bg-gray-900 text-white p-2 rounded"
                    />
                  )}
                  <Button
                    onClick={editIndex === null ? handleAddActivity : handleUpdateActivity}
                    className="w-full bg-yellow-500 text-black hover:bg-yellow-400"
                  >
                    {editIndex === null ? "Agregar actividad" : "Actualizar actividad"}
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
