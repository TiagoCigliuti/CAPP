"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { format, addDays, startOfWeek, subWeeks, addWeeks } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getCurrentTheme, getCurrentClient } from "@/lib/users"

type Activity = { time: string; activity: string }

const actividadSugeridas = ["Desayuno", "Gimnasio", "Entrenamiento técnico", "Evaluación", "Partido", "Libre"]

export default function CalendarioSemanal() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [weekDates, setWeekDates] = useState<Date[]>([])
  const [schedule, setSchedule] = useState<Record<string, Activity[]>>({})
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [newTime, setNewTime] = useState("")
  const [newActivity, setNewActivity] = useState("")
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  const [currentClient, setCurrentClient] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const loadClient = async () => {
      const client = await getCurrentClient()
      setCurrentClient(client)
    }
    loadClient()
  }, [])

  // Obtener colores del tema
  const getThemeColors = () => {
    const currentTheme = getCurrentTheme()

    if (currentTheme?.colors) {
      return {
        primary: currentTheme.colors.primary,
        background: currentTheme.colors.background,
        text: currentTheme.colors.text,
        secondary: currentTheme.colors.secondary,
      }
    } else if (currentTheme) {
      let primaryColor = "#2563EB"
      let backgroundColor = "#FFFFFF"
      let textColor = "#111827"
      const secondaryColor = "#1F2937"

      if (currentTheme.primaryColor?.includes("yellow")) {
        primaryColor = "#EAB308"
      } else if (currentTheme.primaryColor?.includes("red")) {
        primaryColor = "#EF4444"
      }

      if (currentTheme.bgColor?.includes("black")) {
        backgroundColor = "#000000"
      }

      if (currentTheme.textColor?.includes("yellow")) {
        textColor = "#FACC15"
      } else if (currentTheme.textColor?.includes("blue-800")) {
        textColor = "#1E40AF"
      }

      return {
        primary: primaryColor,
        background: backgroundColor,
        text: textColor,
        secondary: secondaryColor,
      }
    }

    return {
      primary: "#2563EB",
      background: "#FFFFFF",
      text: "#111827",
      secondary: "#1F2937",
    }
  }

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
      [selectedDate]: [...(schedule[selectedDate] || []), { time: newTime, activity: newActivity }].sort((a, b) =>
        a.time.localeCompare(b.time),
      ),
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

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white text-gray-900 p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const themeColors = getThemeColors()
  const currentTheme = getCurrentTheme()

  const weekRange = weekDates.length
    ? `Semana del ${format(weekDates[0], "dd 'de' MMMM", { locale: es })} al ${format(weekDates[6], "dd 'de' MMMM", { locale: es })}`
    : ""

  return (
    <div
      className="min-h-screen p-6"
      style={{ backgroundColor: themeColors.background, color: themeColors.text }}
      onClick={() => setSelectedDate("")}
    >
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <Link href="/staff">
          <Button variant="outline" className="hover:bg-gray-100">
            Volver al menú
          </Button>
        </Link>
        <div className="flex flex-col items-center">
          {currentTheme?.logo ? (
            <div className="relative w-[50px] h-[60px] mb-2">
              <Image
                src={currentTheme.logo || "/placeholder.svg"}
                alt="Logo del Club"
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <div
              className="w-[50px] h-[60px] mb-2 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: themeColors.primary }}
            >
              <span className="text-white text-lg font-bold">
                {currentTheme?.clubName
                  ?.split(" ")
                  .map((word: string) => word[0])
                  .join("")
                  .slice(0, 2) || "SD"}
              </span>
            </div>
          )}
          <h1 className="text-2xl font-bold text-center" style={{ color: themeColors.text }}>
            {weekRange}
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentDate(subWeeks(currentDate, 1))}
            className="px-4 py-2 rounded-lg text-white font-semibold transition-all duration-200 hover:opacity-90"
            style={{ backgroundColor: themeColors.secondary }}
          >
            ← Semana anterior
          </button>
          <button
            onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
            className="px-4 py-2 rounded-lg text-white font-semibold transition-all duration-200 hover:opacity-90"
            style={{ backgroundColor: themeColors.secondary }}
          >
            Semana siguiente →
          </button>
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
              className="border rounded-xl p-4 relative transition-all duration-200"
              style={{
                backgroundColor: themeColors.background,
                borderColor: selectedDate === key ? themeColors.primary : "#D1D5DB",
                borderWidth: selectedDate === key ? "2px" : "1px",
              }}
              onClick={(e) => {
                e.stopPropagation()
                setSelectedDate(key)
              }}
            >
              <h2 className="text-lg font-semibold mb-2" style={{ color: themeColors.text }}>
                {format(date, "EEEE dd/MM", { locale: es })}
              </h2>

              {/* Actividades */}
              <ul className="mb-3 space-y-1">
                {actividades.length === 0 && <li className="text-gray-400 italic">Sin actividades</li>}
                {actividades.map((item, idx) => (
                  <li key={idx} className="text-sm flex justify-between items-center gap-2">
                    <span style={{ color: themeColors.text }}>
                      <span className="font-mono" style={{ color: themeColors.primary }}>
                        {item.time}
                      </span>{" "}
                      - {item.activity}
                    </span>
                    <div className="flex gap-2">
                      <Pencil
                        size={16}
                        className="cursor-pointer hover:opacity-70 transition-opacity"
                        style={{ color: themeColors.primary }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(key, idx)
                        }}
                      />
                      <Trash2
                        size={16}
                        className="cursor-pointer text-red-500 hover:text-red-400 transition-colors"
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
                    className="w-full p-2 rounded border"
                    style={{
                      backgroundColor: themeColors.background,
                      color: themeColors.text,
                      borderColor: themeColors.primary,
                    }}
                  />
                  <select
                    value={newActivity}
                    onChange={(e) => setNewActivity(e.target.value)}
                    className="w-full p-2 rounded border"
                    style={{
                      backgroundColor: themeColors.background,
                      color: themeColors.text,
                      borderColor: themeColors.primary,
                    }}
                  >
                    <option value="">Seleccionar actividad</option>
                    {actividadSugeridas.map((op, i) => (
                      <option key={i} value={op}>
                        {op}
                      </option>
                    ))}
                    <option value="custom">Otra...</option>
                  </select>
                  {newActivity === "custom" && (
                    <input
                      type="text"
                      placeholder="Otra actividad..."
                      onChange={(e) => setNewActivity(e.target.value)}
                      className="w-full p-2 rounded border"
                      style={{
                        backgroundColor: themeColors.background,
                        color: themeColors.text,
                        borderColor: themeColors.primary,
                      }}
                    />
                  )}
                  <button
                    onClick={editIndex === null ? handleAddActivity : handleUpdateActivity}
                    className="w-full px-4 py-2 rounded-lg font-semibold text-white transition-all duration-200 hover:opacity-90"
                    style={{ backgroundColor: themeColors.primary }}
                  >
                    {editIndex === null ? "Agregar actividad" : "Actualizar actividad"}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
