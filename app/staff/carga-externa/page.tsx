"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function CargaExternaPage() {
  return (
    <div className="min-h-screen bg-black text-gray-300 p-4">
      <div className="flex justify-between items-center mb-6">
        <Link href="/staff">
          <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
            Volver
          </Button>
        </Link>
        <div className="flex flex-col items-center">
          <div className="relative w-[50px] h-[60px] mb-2">
            <Image src="/penarol-white-bg.png" alt="Escudo Peñarol" fill className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-center text-yellow-400">Carga Externa</h1>
        </div>
        <div className="w-20"></div> {/* Spacer for alignment */}
      </div>

      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="text-center p-8 bg-gray-900 rounded-xl max-w-md">
          <h2 className="text-xl font-semibold text-yellow-400 mb-4">Sección en Desarrollo</h2>
          <p className="mb-4">Esta sección está actualmente en desarrollo. Pronto estará disponible.</p>
          <Link href="/staff">
            <Button className="bg-yellow-500 hover:bg-yellow-400 text-black">Volver al menú principal</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
