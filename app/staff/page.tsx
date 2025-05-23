"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function StaffMenu() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-black text-gray-300 p-4">
      <div className="flex justify-between items-center mb-6">
        <Link href="/">
          <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
            Volver al inicio
          </Button>
        </Link>
        <div className="flex flex-col items-center">
          <div className="relative w-[80px] h-[100px] mb-2">
            <Image src="/penarol-white-bg.png" alt="Escudo Peñarol" fill className="object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-yellow-400 text-center">Panel del Staff</h1>
        </div>
        <div className="w-20" />
      </div>

      <div className="grid gap-6 w-full max-w-md mx-auto mt-8">
        <Button
          className="w-full bg-gray-800 text-white hover:bg-yellow-500 hover:text-black text-xl py-6 transition"
          onClick={() => router.push("/staff/jugadores")}
        >
          👤 Jugadores
        </Button>
        <Button
          className="w-full bg-gray-800 text-white hover:bg-yellow-500 hover:text-black text-xl py-6 transition"
          onClick={() => router.push("/staff/calendario")}
        >
          📅 Calendario
        </Button>
        <Button
          onClick={() => router.push("/staff/evaluaciones")}
          className="w-full bg-gray-800 hover:bg-gray-700 text-xl py-6"
        >
          🧪 Evaluaciones
        </Button>
        <Button
          onClick={() => router.push("/staff/carga-externa")}
          className="w-full bg-gray-800 hover:bg-gray-700 text-xl py-6"
        >
          📊 Carga Externa
        </Button>
        <Button
          onClick={() => router.push("/staff/carga-interna")}
          className="w-full bg-gray-800 hover:bg-gray-700 text-xl py-6"
        >
          💬 Carga Interna
        </Button>
        <Button
          onClick={() => router.push("/staff/entrenamientos")}
          className="w-full bg-gray-800 hover:bg-gray-700 text-xl py-6"
        >
          🏋️ Gestión de Entrenamientos
        </Button>
        <Button
          onClick={() => router.push("/staff/partidos")}
          className="w-full bg-gray-800 hover:bg-gray-700 text-xl py-6"
        >
          🏟️ Gestión de Partidos
        </Button>
      </div>
    </div>
  )
}
