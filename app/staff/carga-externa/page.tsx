"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useTheme } from "@/hooks/useTheme"

export default function CargaExternaPage() {
  const { theme: currentTheme, clientData } = useTheme()

  // Create a safe theme object with fallback values
  const safeTheme = {
    bgColor: currentTheme?.bgColor || "bg-white",
    textColor: currentTheme?.textColor || "text-gray-900",
    borderColor: currentTheme?.borderColor || "border-gray-300",
    cardBg: currentTheme?.cardBg || "bg-white",
    primaryColor: currentTheme?.primaryColor || "bg-blue-600",
    logo: currentTheme?.logo || clientData?.logo,
  }

  const clubName = clientData?.clubName || "Club"
  const clubInitials = clubName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()

  return (
    <div className={`min-h-screen ${safeTheme.bgColor} ${safeTheme.textColor} p-4`}>
      <div className="flex justify-between items-center mb-6">
        <Link href="/staff">
          <Button variant="outline" className={`${safeTheme.borderColor} ${safeTheme.textColor} hover:bg-gray-100`}>
            Volver
          </Button>
        </Link>
        <div className="flex flex-col items-center">
          {safeTheme.logo ? (
            <div className="relative w-[50px] h-[60px] mb-2">
              <Image src={safeTheme.logo || "/placeholder.svg"} alt="Logo" fill className="object-contain" />
            </div>
          ) : (
            <div
              className={`w-[50px] h-[60px] mb-2 ${safeTheme.primaryColor} text-white rounded-lg flex items-center justify-center text-lg font-bold`}
            >
              {clubInitials}
            </div>
          )}
          <h1 className={`text-2xl font-bold text-center ${safeTheme.textColor}`}>Carga Externa</h1>
        </div>
        <div className="w-20"></div>
      </div>

      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className={`text-center p-8 ${safeTheme.cardBg} border ${safeTheme.borderColor} rounded-xl max-w-md`}>
          <h2 className={`text-xl font-semibold ${safeTheme.textColor} mb-4`}>Sección en Desarrollo</h2>
          <p className="mb-4 text-gray-600">Esta sección está actualmente en desarrollo. Pronto estará disponible.</p>
          <Link href="/staff">
            <Button className={`${safeTheme.primaryColor} text-white`}>Volver al menú principal</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
