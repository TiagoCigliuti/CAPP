"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { getCurrentUser, clearCurrentUser, isAdmin, getClients, getUsers } from "@/lib/users"
import { clearUserTheme } from "@/lib/themes"

export default function AdminPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [stats, setStats] = useState({
    admins: 0,
    clients: 0,
    users: 0,
    systemStatus: "100%",
  })

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)

    // Verificar que el usuario sea admin
    if (!user || !isAdmin(user)) {
      router.push("/")
    }
  }, [router])

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [usersData, clientsData] = await Promise.all([getUsers(), getClients()])

        const adminCount = usersData.filter((u) => u.role === "admin").length
        const clientCount = clientsData.length
        const userCount = usersData.filter((u) => u.role === "client_user").length

        setStats({
          admins: adminCount,
          clients: clientCount,
          users: userCount,
          systemStatus: "100%",
        })
      } catch (error) {
        console.error("Error loading stats:", error)
      }
    }

    loadStats()
  }, [])

  const handleLogout = () => {
    clearCurrentUser()
    clearUserTheme()
    router.push("/")
  }

  if (!currentUser || !isAdmin(currentUser)) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Verificando permisos de administrador...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="relative w-[60px] h-[75px]">
              <div className="w-full h-full bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-2xl font-bold">AD</span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
              <p className="text-gray-600">Administrador: {currentUser.username}</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
            Cerrar Sesión
          </Button>
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏢</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Gestión de Clientes</h2>
              <p className="text-gray-600 mb-6">Crear y administrar clientes del sistema</p>
              <Button
                onClick={() => router.push("/admin/clients")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              >
                Gestionar Clientes
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Gestión de Usuarios</h2>
              <p className="text-gray-600 mb-6">Crear usuarios y asignarlos a clientes</p>
              <Button
                onClick={() => router.push("/admin/users")}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
              >
                Gestionar Usuarios
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👤</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Mi Perfil</h2>
              <p className="text-gray-600 mb-6">Administrar mi cuenta y configuración</p>
              <Button
                onClick={() => router.push("/admin/profile")}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
              >
                Gestionar Perfil
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Sistema</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.admins}</div>
              <div className="text-sm text-gray-600">Administradores</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.clients}</div>
              <div className="text-sm text-gray-600">Clientes</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.users}</div>
              <div className="text-sm text-gray-600">Usuarios</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{stats.systemStatus}</div>
              <div className="text-sm text-gray-600">Sistema Activo</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
