"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function GestionTareasPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-black text-gray-300 p-4">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <Link href="/staff/entrenamientos">
          <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
            Volver
          </Button>
        </Link>
        <div className="flex flex-col items-center">
          <div className="relative w-[80px] h-[100px] mb-2">
            <Image src="/penarol-white-bg.png" alt="Escudo Peñarol" fill className="object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-yellow-400 text-center">Gestión de Tareas</h1>
        </div>
        <div className="w-20" />
      </div>

      {/* Botones de tipo de tareas */}
      <div className="grid gap-6 w-full max-w-md mx-auto mt-8">
        <Button
          onClick={() => router.push("/staff/entrenamientos/gestion/cancha")}
          className="w-full bg-gray-800 hover:bg-yellow-500 hover:text-black text-xl py-6"
        >
          ⚽ Tareas de cancha
        </Button>
        <Button
          onClick={() => router.push("/staff/entrenamientos/gestion/gimnasio")}
          className="w-full bg-gray-800 hover:bg-yellow-500 hover:text-black text-xl py-6"
        >
          🏋️ Tareas de gimnasio
        </Button>
      </div>
    </div>
  )
}
