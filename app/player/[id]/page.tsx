"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"
import Image from "next/image"
import { obtenerJugador } from "@/lib/firestoreHelpers"

const wellnessQuestions = [
  {
    name: "mood",
    label: "Estado de ánimo",
    options: ["Muy bueno", "Bueno", "Normal", "Malo", "Muy malo"],
  },
  {
    name: "sleepQuality",
    label: "Calidad del sueño",
    options: ["Muy bueno", "Bueno", "Normal", "Malo", "Muy malo"],
  },
  {
    name: "sleepHours",
    label: "Horas de sueño",
    options: ["Más de 10hs", "Entre 9 y 10hs", "Aproximadamente 8hs", "Entre 6 y 7hs", "Menos de 6hs"],
  },
  {
    name: "recovery",
    label: "Nivel de recuperación",
    options: ["Totalmente recuperado", "Casi recuperado", "Parcialmente recuperado", "Algo cansado", "Muy cansado"],
  },
  {
    name: "soreness",
    label: "Dolor muscular",
    options: ["Ninguno", "Muy poco", "Siento dolor", "Bastante", "Extremo"],
  },
]

const optionalQuestion = {
  name: "painType",
  label: "De sentir cansancio o dolor muscular:",
  options: ["Es general", "Es específico"],
}

const rpeOptions = [
  "Nula",
  "Casi nula",
  "Extremadamente baja",
  "Muy baja",
  "Baja",
  "Moderada",
  "Levemente exigente",
  "Algo exigente",
  "Muy exigente",
  "Extremadamente exigente",
  "Máxima",
]

const getToday = () => new Date().toISOString().split("T")[0]

export default function PlayerFormPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [section, setSection] = useState<"wellness" | "rpe">("wellness")
  const [wellnessData, setWellnessData] = useState<Record<string, string>>({})
  const [rpe, setRpe] = useState<string>("")
  const [painDescription, setPainDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [jugador, setJugador] = useState<any>(null)

  useEffect(() => {
    const loadPlayerData = async () => {
      try {
        const playerData = await obtenerJugador(id)
        if (playerData) {
          setJugador(playerData)
        } else {
          // Fallback for mock data
          setJugador({
            nombre:
              id
                ?.replace(/-/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())
                .split(" ")[0] || "Jugador",
            apellido:
              id
                ?.replace(/-/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())
                .split(" ")[1] || "",
          })
        }
      } catch (error) {
        console.error("Error loading player:", error)
        // Fallback for mock data
        setJugador({
          nombre:
            id
              ?.replace(/-/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase())
              .split(" ")[0] || "Jugador",
          apellido:
            id
              ?.replace(/-/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase())
              .split(" ")[1] || "",
        })
      }
    }

    if (id) {
      loadPlayerData()
    }
  }, [id])

  // Load saved data from localStorage when component mounts
  useEffect(() => {
    if (typeof window !== "undefined" && id) {
      const savedData = localStorage.getItem(`wellness-${id}`)
      const savedRpe = localStorage.getItem(`rpe-${id}`)
      const today = getToday()

      if (savedData) {
        try {
          const parsed = JSON.parse(savedData)
          if (parsed.date === today) {
            setWellnessData(parsed.wellnessData || {})
            setPainDescription(parsed.painDescription || "")
          }
        } catch (error) {
          console.error("Error parsing saved wellness data:", error)
        }
      }

      if (savedRpe) {
        try {
          const parsed = JSON.parse(savedRpe)
          if (parsed.date === today) {
            setRpe(parsed.rpe || "")
          }
        } catch (error) {
          console.error("Error parsing saved RPE data:", error)
        }
      }
    }
  }, [id])

  const handleOptionSelect = (field: string, value: string) => {
    const current = wellnessData[field]
    const updatedValue = current === value ? "" : value
    setWellnessData({ ...wellnessData, [field]: updatedValue })
  }

  const handleSubmitWellness = () => {
    // Validate that all required questions are answered
    const unansweredQuestions = wellnessQuestions.filter((q) => !wellnessData[q.name]).map((q) => q.label)

    if (unansweredQuestions.length > 0) {
      toast({
        title: "Formulario incompleto",
        description: `Por favor responda todas las preguntas: ${unansweredQuestions.join(", ")}`,
        variant: "destructive",
      })
      return
    }

    // Validate that pain description is provided if pain type is specific
    if (wellnessData.painType === "Es específico" && !painDescription.trim()) {
      toast({
        title: "Descripción requerida",
        description: "Por favor describa la zona de dolor específica",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const data = {
        wellnessData,
        painDescription,
        date: getToday(),
      }

      localStorage.setItem(`wellness-${id}`, JSON.stringify(data))

      toast({
        title: "Datos guardados",
        description: "Respuestas de wellness guardadas correctamente",
      })

      // Navigate back to players page
      router.push("/players")
    } catch (error) {
      console.error("Error saving wellness data:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al guardar los datos. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitRpe = () => {
    if (!rpe) {
      toast({
        title: "Selección requerida",
        description: "Por favor seleccione un nivel de RPE",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const data = {
        rpe,
        date: getToday(),
      }

      localStorage.setItem(`rpe-${id}`, JSON.stringify(data))

      toast({
        title: "Datos guardados",
        description: "Respuesta de RPE guardada correctamente",
      })

      // Navigate back to players page
      router.push("/players")
    } catch (error) {
      console.error("Error saving RPE data:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al guardar los datos. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderWellnessForm = () => (
    <div className="mt-4 bg-gray-900 rounded-xl p-4">
      <div className="space-y-6">
        {wellnessQuestions.map((q) => (
          <div key={q.name} className="mb-6">
            <Label className="block mb-2 font-semibold text-yellow-400">{q.label}</Label>
            <div className="flex flex-col gap-2">
              {q.options.map((opt) => (
                <Button
                  key={opt}
                  type="button"
                  variant={wellnessData[q.name] === opt ? "default" : "outline"}
                  onClick={() => handleOptionSelect(q.name, opt)}
                  className={`w-full justify-start ${
                    wellnessData[q.name] === opt
                      ? "bg-yellow-500 text-black hover:bg-yellow-400"
                      : "bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
                  }`}
                >
                  {opt}
                </Button>
              ))}
            </div>
          </div>
        ))}

        {/* Pregunta opcional */}
        <div className="mb-6">
          <Label className="block mb-2 font-semibold text-yellow-400">{optionalQuestion.label}</Label>
          <div className="flex flex-col gap-2">
            {optionalQuestion.options.map((opt) => (
              <Button
                key={opt}
                type="button"
                variant={wellnessData[optionalQuestion.name] === opt ? "default" : "outline"}
                onClick={() => handleOptionSelect(optionalQuestion.name, opt)}
                className={`w-full justify-start ${
                  wellnessData[optionalQuestion.name] === opt
                    ? "bg-yellow-500 text-black hover:bg-yellow-400"
                    : "bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
                }`}
              >
                {opt}
              </Button>
            ))}
          </div>
        </div>

        {wellnessData.painType === "Es específico" && (
          <div className="mb-6">
            <Label htmlFor="painDescription" className="block mb-2 font-semibold text-yellow-400">
              De ser específico, describa en qué zona/s:
            </Label>
            <Textarea
              id="painDescription"
              value={painDescription}
              onChange={(e) => setPainDescription(e.target.value)}
              placeholder="Ejemplo: isquiosural izquierdo"
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
        )}

        <Button
          type="button"
          className="w-full mt-4 bg-yellow-500 hover:bg-yellow-400 text-black"
          onClick={handleSubmitWellness}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Guardando..." : "Guardar Wellness"}
        </Button>
      </div>
    </div>
  )

  const renderRpeForm = () => (
    <div className="mt-4 bg-gray-900 rounded-xl p-4">
      <div className="space-y-4">
        <Label className="block mb-2 font-semibold text-yellow-400">Percepción de la carga de entrenamiento:</Label>
        <div className="flex flex-col gap-2 mb-6">
          {rpeOptions.map((opt, index) => (
            <Button
              key={opt}
              type="button"
              variant={rpe === opt ? "default" : "outline"}
              onClick={() => setRpe(rpe === opt ? "" : opt)}
              className={`w-full justify-start ${
                rpe === opt
                  ? "bg-yellow-500 text-black hover:bg-yellow-400"
                  : "bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
              }`}
            >
              <span className="mr-2">{index}</span> {opt}
            </Button>
          ))}
        </div>
        <Button
          type="button"
          className="w-full mt-4 bg-yellow-500 hover:bg-yellow-400 text-black"
          onClick={handleSubmitRpe}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Guardando..." : "Guardar RPE"}
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen p-4 bg-black text-gray-300">
      <div className="flex justify-between items-center mb-6">
        <Link href="/players">
          <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
            Volver
          </Button>
        </Link>
        <div className="flex flex-col items-center">
          <div className="relative w-[50px] h-[60px] mb-2">
            <Image src="/penarol-white-bg.png" alt="Escudo Peñarol" fill className="object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-yellow-400 text-center mb-6">
            Formulario - {jugador?.nombre} {jugador?.apellido}
          </h1>
        </div>
        <div className="w-20"></div> {/* Spacer for alignment */}
      </div>

      <div className="flex justify-center gap-4 mb-6">
        <Button
          variant={section === "wellness" ? "default" : "outline"}
          onClick={() => setSection("wellness")}
          className={
            section === "wellness"
              ? "bg-yellow-500 text-black hover:bg-yellow-400"
              : "bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
          }
        >
          Wellness
        </Button>
        <Button
          variant={section === "rpe" ? "default" : "outline"}
          onClick={() => setSection("rpe")}
          className={
            section === "rpe"
              ? "bg-yellow-500 text-black hover:bg-yellow-400"
              : "bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
          }
        >
          RPE
        </Button>
      </div>

      {section === "wellness" && renderWellnessForm()}
      {section === "rpe" && renderRpeForm()}
    </div>
  )
}
