"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useTheme } from "@/hooks/useTheme"

export default function EntrenamientosPage() {
  const router = useRouter()
  const { theme, clientData } = useTheme()

  // Crear un objeto de tema seguro con valores por defecto
  const safeTheme = {
    bgColor: theme?.bgColor || "bg-white",
    textColor: theme?.textColor || "text-black",
    primaryColor: theme?.primaryColor || "bg-blue-600",
    secondaryColor: theme?.secondaryColor || "bg-gray-600",
    borderColor: theme?.borderColor || "border-gray-300",
    logo: theme?.logo || clientData?.logo || null,
  }

  return (
    <div className={`min-h-screen ${safeTheme.bgColor} ${safeTheme.textColor} p-6`}>
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <Link href="/staff">
          <Button variant="outline" className={`${safeTheme.borderColor} ${safeTheme.textColor} hover:bg-gray-100`}>
            Volver al panel
          </Button>
        </Link>
        <div className="flex flex-col items-center">
          {safeTheme.logo ? (
            <div className="relative w-[80px] h-[100px] mb-2">
              <Image src={safeTheme.logo || "/placeholder.svg"} alt="Logo" fill className="object-contain" />
            </div>
          ) : (
            clientData?.clubName && (
              <div className="w-[80px] h-[100px] mb-2 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-600">
                  {clientData.clubName
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .slice(0, 2)}
                </span>
              </div>
            )
          )}
          <h1 className={`text-3xl font-bold ${safeTheme.textColor} text-center`}>Gestión de Entrenamientos</h1>
        </div>
        <div className="w-20" /> {/* Espaciador */}
      </div>

      {/* Botones de navegación */}
      <div className="grid gap-6 w-full max-w-md mx-auto mt-8">
        <Button
          onClick={() => router.push("/staff/entrenamientos/planificacion")}
          className={`w-full ${safeTheme.secondaryColor} text-white hover:bg-gray-700 text-xl py-6`}
        >
          🗓️ Planificación
        </Button>
        <Button
          onClick={() => router.push("/staff/entrenamientos/gestion")}
          className={`w-full ${safeTheme.secondaryColor} text-white hover:bg-gray-700 text-xl py-6`}
        >
          🛠️ Gestión de tareas
        </Button>
      </div>
    </div>
  )
}
