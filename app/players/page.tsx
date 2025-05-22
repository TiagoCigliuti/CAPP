"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const players = Array.from({ length: 10 }, (_, i) => ({
  name: `Jugador ${i + 1}`,
  image: `/placeholder.svg?height=96&width=96&text=${i + 1}`,
  id: `jugador-${i + 1}`,
}))

export default function PlayersPage() {
  const router = useRouter()

  const handleClick = (id: string) => {
    router.push(`/player/${id}`)
  }

  return (
    <div className="min-h-screen bg-black text-gray-300 p-4">
      <div className="flex justify-between items-center mb-8">
        <Link href="/">
          <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
            Volver
          </Button>
        </Link>
        <div className="flex flex-col items-center">
          <div className="relative w-[50px] h-[60px] mb-2">
            <Image src="/penarol-white-bg.png" alt="Escudo Peñarol" fill className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-center text-yellow-400">Selecciona tu perfil</h1>
        </div>
        <div className="w-20"></div> {/* Spacer for alignment */}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
        {players.map((player) => (
          <div
            key={player.id}
            onClick={() => handleClick(player.id)}
            className="bg-gray-800 rounded-xl p-4 flex flex-col items-center cursor-pointer hover:bg-gray-700 transition"
          >
            <div className="relative w-20 h-20 mb-2">
              <Image
                src={player.image || "/placeholder.svg"}
                alt={player.name}
                fill
                className="rounded-full bg-yellow-500 object-cover"
              />
            </div>
            <span className="text-sm font-medium text-center text-white">{player.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
