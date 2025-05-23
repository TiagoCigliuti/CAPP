"use client"

import { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { clubThemes, getCurrentTheme } from "@/lib/themes"

const players = Array.from({ length: 10 }, (_, i) => `Jugador ${i + 1}`)

const questionKeys = [
  { key: "mood", label: "Ánimo" },
  { key: "sleepQuality", label: "Sueño" },
  { key: "sleepHours", label: "Horas Sueño" },
  { key: "recovery", label: "Recuperación" },
  { key: "soreness", label: "Dolor Muscular" },
  { key: "painType", label: "Tipo Dolor" },
  { key: "painDescription", label: "Zona Dolor" },
  { key: "rpe", label: "RPE" },
]

const mapOptionToNumber = (text: string) => {
  const opciones = [
    ["Muy bueno", "Más de 10hs", "Totalmente recuperado", "Ninguno"],
    ["Bueno", "Entre 9 y 10hs", "Casi recuperado", "Muy poco"],
    ["Normal", "Aproximadamente 8hs", "Parcialmente recuperado", "Siento dolor"],
    ["Malo", "Entre 6 y 7hs", "Algo cansado", "Bastante"],
    ["Muy malo", "Menos de 6hs", "Muy cansado", "Extremo"],
  ]
  for (let i = 0; i < opciones.length; i++) {
    if (opciones[i].includes(text)) return i + 1
  }
  return null
}

const getColor = (value: number | string | null) => {
  const colors: Record<number, string> = {
    1: "bg-blue-800 text-white",
    2: "bg-green-700 text-white",
    3: "bg-yellow-600 text-black",
    4: "bg-orange-600 text-white",
    5: "bg-red-700 text-white",
  }
  return typeof value === "number" && colors[value] ? colors[value] : "bg-gray-800 text-white"
}

export default function CargaInternaDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState(clubThemes.default)

  useEffect(() => {
    const currentTheme = getCurrentTheme()
    setTheme(clubThemes[currentTheme])
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLoading(true)
      const data: Record<string, any> = {}

      players.forEach((_, i) => {
        const id = `jugador-${i + 1}`
        const wellnessRaw = localStorage.getItem(`wellness-${id}`)
        const rpeRaw = localStorage.getItem(`rpe-${id}`)
        const today = selectedDate

        let wellness = null
        if (wellnessRaw) {
          try {
            const parsed = JSON.parse(wellnessRaw)
            if (parsed.date === today) {
              wellness = parsed
            }
          } catch (error) {
            console.error(`Error parsing wellness data for ${id}:`, error)
          }
        }

        let rpe = null
        if (rpeRaw) {
          try {
            const parsed = JSON.parse(rpeRaw)
            if (parsed.date === today) {
              rpe = parsed.rpe
            }
          } catch (error) {
            console.error(`Error parsing RPE data for ${id}:`, error)
          }
        }

        data[`Jugador ${i + 1}`] = {
          ...wellness?.wellnessData,
          painDescription: wellness?.painDescription || "-",
          rpe: rpe || "-",
          painType: wellness?.wellnessData?.painType || "-",
        }
      })

      setResponses(data)
      setLoading(false)
    }
  }, [selectedDate])

  const exportCSV = () => {
    const headers = ["Jugador", ...questionKeys.map((q) => q.label)].join(",")
    const rows = players.map((player) => {
      const values = questionKeys.map((q) => {
        const raw = responses[player]?.[q.key] || "-"
        const numeric = mapOptionToNumber(raw)
        return numeric || raw
      })
      return [player, ...values].join(",")
    })
    const csv = [headers, ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `respuestas_${selectedDate}.csv`
    link.click()
  }

  const getCompletionStatus = () => {
    const total = players.length
    let completed = 0
    let partial = 0

    players.forEach((player) => {
      const hasWellness = Object.keys(responses[player] || {}).some(
        (key) => key !== "rpe" && responses[player][key] !== "-",
      )
      const hasRpe = responses[player]?.rpe !== "-"

      if (hasWellness && hasRpe) completed++
      else if (hasWellness || hasRpe) partial++
    })

    return { total, completed, partial }
  }

  const stats = getCompletionStatus()

  return (
    <div className={`p-4 min-h-screen ${theme.bgColor} ${theme.textColor}`}>
      <div className="flex justify-between items-center mb-6">
        <Link href="/staff">
          <Button variant="outline" className={`${theme.borderColor} ${theme.textColor} hover:bg-gray-100`}>
            Volver
          </Button>
        </Link>
        <div className="flex flex-col items-center">
          {theme.logo && (
            <div className="relative w-[50px] h-[60px] mb-2">
              <Image src={theme.logo || "/placeholder.svg"} alt="Logo" fill className="object-contain" priority />
            </div>
          )}
          <h1 className={`text-2xl font-bold text-center ${theme.textColor}`}>Carga Interna</h1>
        </div>
        <div className="w-20"></div> {/* Spacer for alignment */}
      </div>

      <div className={`${theme.cardBg} border ${theme.borderColor} rounded-xl p-4 mb-6`}>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-1">
              <Label htmlFor="date-select" className="text-gray-300">
                Seleccionar Fecha
              </Label>
              <Input
                id="date-select"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <Button onClick={exportCSV} className={`flex items-center gap-2 ${theme.primaryColor} text-white`}>
              <Download size={16} />
              Exportar CSV
            </Button>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{stats.completed}</div>
              <div className="text-sm">Completos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">{stats.partial}</div>
              <div className="text-sm">Parciales</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-400">{stats.total - stats.completed - stats.partial}</div>
              <div className="text-sm">Pendientes</div>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-auto rounded-xl shadow-lg">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className={`${theme.cardBg} border ${theme.borderColor}`}>
              <th className={`border ${theme.borderColor} px-3 py-2 text-left ${theme.textColor}`}>Jugador</th>
              {questionKeys.map((q) => (
                <th key={q.key} className="border border-gray-700 px-3 py-2 text-left text-yellow-400">
                  {q.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={questionKeys.length + 1}
                  className="border border-gray-700 px-4 py-8 text-center bg-gray-900"
                >
                  Cargando datos...
                </td>
              </tr>
            ) : (
              players.map((player) => (
                <tr key={player} className="hover:bg-gray-800">
                  <td className="border border-gray-700 px-3 py-2 font-medium">{player}</td>
                  {questionKeys.map((q) => {
                    const rawValue = responses[player]?.[q.key] || "-"
                    const numeric = mapOptionToNumber(rawValue)
                    const display = numeric || rawValue
                    const bg = getColor(numeric)
                    return (
                      <td key={q.key} className={`border border-gray-700 px-3 py-2 text-center ${bg}`}>
                        {display}
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 bg-gray-900 p-4 rounded-xl">
        <h2 className="text-lg font-semibold mb-2 text-yellow-400">Leyenda de colores</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-800 mr-2"></div>
            <span className="text-sm">1 - Muy bueno</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-700 mr-2"></div>
            <span className="text-sm">2 - Bueno</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-600 mr-2"></div>
            <span className="text-sm">3 - Normal</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-orange-600 mr-2"></div>
            <span className="text-sm">4 - Malo</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-700 mr-2"></div>
            <span className="text-sm">5 - Muy malo</span>
          </div>
        </div>
      </div>
    </div>
  )
}
