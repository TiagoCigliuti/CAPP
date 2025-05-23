"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center">
      <div className="mb-6 relative w-[120px] h-[150px]">
        <Image src="/penarol-white-bg.png" alt="Escudo Peñarol" fill className="object-contain" priority />
      </div>
      <h1 className="text-yellow-400 text-3xl font-bold text-center mb-10">Departamento de Ciencias del Deporte</h1>
      <div className="grid gap-6 w-full max-w-xs">
        <Button onClick={() => router.push("/players")} className="w-full bg-gray-800 hover:bg-gray-700 text-xl py-6">
          🧍 Ingreso Jugadores
        </Button>
        <Button
          onClick={() => router.push("/staff-login")}
          className="w-full bg-gray-800 hover:bg-gray-700 text-xl py-6"
        >
          🧑‍💼 Ingreso Staff
        </Button>
      </div>
    </div>
  )
}
