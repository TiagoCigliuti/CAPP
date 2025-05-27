"use client"

import { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import Link from "next/link"
import { clubThemes } from "@/lib/themes"
import { getCurrentUser, getCurrentClient } from "@/lib/users"
import { obtenerJugadores } from "@/lib/firestoreHelpers"
import { useTheme } from "@/hooks/useTheme"

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
  const [jugadores, setJugadores] = useState<any[]>([])
  const [currentClient, setCurrentClient] = useState<any>(null)

  const { theme: currentTheme, clientData } = useTheme()

  // Crear objeto de tema seguro
  const safeTheme = {
    bgColor: currentTheme?.bgColor || clubThemes.default.bgColor,
    textColor: currentTheme?.textColor || clubThemes.default.textColor,
    cardBg: currentTheme?.cardBg || clubThemes.default.cardBg,
    borderColor: currentTheme?.borderColor || clubThemes.default.borderColor,
    primaryColor: currentTheme?.primaryColor || clubThemes.default.primaryColor,
  }

  const theme = safeTheme

  useEffect(() => {
    async function cargarDatos() {
      try {
        const user = getCurrentUser()
        if (!user) return

        const client = await getCurrentClient()
        setCurrentClient(client)

        if (client) {
          // Cargar jugadores del cliente actual
          const jugadoresData = await obtenerJugadores(client.id)
          setJugadores(jugadoresData)
        }
      } catch (error) {
        console.error("Error cargando datos:", error)
        setJugadores([])
      }
    }

    cargarDatos()
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined" && jugadores.length > 0) {
      setLoading(true)
      const data: Record<string, any> = {}

      jugadores.forEach((jugador) => {
        const wellnessRaw = localStorage.getItem(`wellness-${jugador.id}`)
        const rpeRaw = localStorage.getItem(`rpe-${jugador.id}`)
        const today = selectedDate

        let wellness = null
        if (wellnessRaw) {
          try {
            const parsed = JSON.parse(wellnessRaw)
            if (parsed.date === today) {
              wellness = parsed
            }
          } catch (error) {
            console.error(`Error parsing wellness data for ${jugador.id}:`, error)
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
            console.error(`Error parsing RPE data for ${jugador.id}:`, error)
          }
        }

        const playerName = `${jugador.nombre} ${jugador.apellido}`
        data[playerName] = {
          ...wellness?.wellnessData,
          painDescription: wellness?.painDescription || "-",
          rpe: rpe || "-",
          painType: wellness?.wellnessData?.painType || "-",
        }
      })

      setResponses(data)
      setLoading(false)
    } else if (jugadores.length === 0 && !loading) {
      setResponses({})
      setLoading(false)
    }
  }, [selectedDate, jugadores])

  const exportCSV = () => {
    const playerNames = Object.keys(responses)
    const headers = ["Jugador", ...questionKeys.map((q) => q.label)].join(",")
    const rows = playerNames.map((player) => {
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
    const playerNames = Object.keys(responses)
    const total = playerNames.length
    let completed = 0
    let partial = 0

    playerNames.forEach((player) => {
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
          {clientData?.logo ? (
            <img
              src={clientData.logo || "/placeholder.svg"}
              alt={clientData.clubName || "Club"}
              className="w-16 h-16 rounded-full object-cover mb-2"
            />
          ) : (
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-2">
              <span className="text-white text-xl font-bold">
                {clientData?.clubName ? clientData.clubName.charAt(0).toUpperCase() : "SD"}
              </span>
            </div>
          )}
          <h1 className={`text-2xl font-bold text-center ${theme.textColor}`}>Carga Interna</h1>
          {currentClient && <p className="text-sm text-gray-600 mt-1">Cliente: {currentClient.name}</p>}
        </div>
        <div className="w-20"></div>
      </div>

      <div className={`${theme.cardBg} border ${theme.borderColor} rounded-xl p-4 mb-6`}>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-1">
              <Label htmlFor="date-select" className="text-gray-700">
                Seleccionar Fecha
              </Label>
              <Input
                id="date-select"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
            <Button onClick={exportCSV} className={`flex items-center gap-2 ${theme.primaryColor} text-white`}>
              <Download size={16} />
              Exportar CSV
            </Button>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-gray-600">Completos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{stats.partial}</div>
              <div className="text-sm text-gray-600">Parciales</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{stats.total - stats.completed - stats.partial}</div>
              <div className="text-sm text-gray-600">Pendientes</div>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-auto rounded-xl shadow-lg">
        <table className="min-w-full border-collapse bg-white">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-3 py-2 text-left text-gray-900">Jugador</th>
              {questionKeys.map((q) => (
                <th key={q.key} className="border border-gray-300 px-3 py-2 text-left text-gray-900">
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
                  className="border border-gray-300 px-4 py-8 text-center bg-white text-gray-600"
                >
                  Cargando datos...
                </td>
              </tr>
            ) : Object.keys(responses).length === 0 ? (
              <tr>
                <td
                  colSpan={questionKeys.length + 1}
                  className="border border-gray-300 px-4 py-8 text-center bg-white text-gray-600"
                >
                  No hay jugadores registrados en el sistema
                </td>
              </tr>
            ) : (
              Object.keys(responses).map((player) => (
                <tr key={player} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-3 py-2 font-medium text-gray-900">{player}</td>
                  {questionKeys.map((q) => {
                    const rawValue = responses[player]?.[q.key] || "-"
                    const numeric = mapOptionToNumber(rawValue)
                    const display = numeric || rawValue
                    const bg = getColor(numeric)
                    return (
                      <td key={q.key} className={`border border-gray-300 px-3 py-2 text-center ${bg}`}>
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

      <div className="mt-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
        <h2 className="text-lg font-semibold mb-2 text-gray-900">Leyenda de colores</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-800 mr-2"></div>
            <span className="text-sm text-gray-700">1 - Muy bueno</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-700 mr-2"></div>
            <span className="text-sm text-gray-700">2 - Bueno</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-600 mr-2"></div>
            <span className="text-sm text-gray-700">3 - Normal</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-orange-600 mr-2"></div>
            <span className="text-sm text-gray-700">4 - Malo</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-700 mr-2"></div>
            <span className="text-sm text-gray-700">5 - Muy malo</span>
          </div>
        </div>
      </div>
    </div>
  )
}
