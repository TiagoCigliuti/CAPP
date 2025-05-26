"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getCurrentUser, isAdmin, getUsers, getClients, createUser, updateUser } from "@/lib/users"
import { toast } from "@/hooks/use-toast"
import { Pencil, Plus, X, Filter, Users } from "lucide-react"
import Link from "next/link"

export default function UsersManagement() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [selectedClientFilter, setSelectedClientFilter] = useState<string>("all")
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    clientId: "",
    status: "active" as "active" | "inactive",
  })

  useEffect(() => {
    const user = getCurrentUser()
    if (!user || !isAdmin(user)) {
      router.push("/")
      return
    }

    loadData()
  }, [router])

  useEffect(() => {
    // Filtrar usuarios basado en el cliente seleccionado
    if (selectedClientFilter === "all") {
      setFilteredUsers(users)
    } else if (selectedClientFilter === "no-client") {
      setFilteredUsers(users.filter((user) => !user.clientId))
    } else {
      setFilteredUsers(users.filter((user) => user.clientId === selectedClientFilter))
    }
  }, [users, selectedClientFilter])

  const loadData = async () => {
    try {
      setLoading(true)
      const [usersData, clientsData] = await Promise.all([getUsers(), getClients()])
      setUsers(usersData.filter((u) => u.role === "client_user"))
      setClients(clientsData)
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ username: "", password: "", clientId: "", status: "active" })
    setEditingUser(null)
    setShowForm(false)
  }

  const handleCreateUser = async () => {
    if (!formData.username.trim() || !formData.password.trim() || !formData.clientId) {
      toast({
        title: "Error",
        description: "Todos los campos son requeridos",
        variant: "destructive",
      })
      return
    }

    // Verificar que el username no exista
    const existingUser = users.find((u) => u.username === formData.username)
    if (existingUser) {
      toast({
        title: "Error",
        description: "El nombre de usuario ya existe",
        variant: "destructive",
      })
      return
    }

    try {
      await createUser(formData.username, formData.password, formData.clientId)
      await loadData()

      toast({
        title: "Usuario creado",
        description: `Usuario "${formData.username}" creado exitosamente`,
      })

      resetForm()
    } catch (error) {
      console.error("Error creating user:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el usuario",
        variant: "destructive",
      })
    }
  }

  const handleUpdateUser = async () => {
    if (!editingUser || !formData.username.trim() || !formData.password.trim() || !formData.clientId) {
      toast({
        title: "Error",
        description: "Todos los campos son requeridos",
        variant: "destructive",
      })
      return
    }

    // Verificar que el username no exista en otro usuario
    const existingUser = users.find((u) => u.username === formData.username && u.id !== editingUser.id)
    if (existingUser) {
      toast({
        title: "Error",
        description: "El nombre de usuario ya existe",
        variant: "destructive",
      })
      return
    }

    try {
      await updateUser(editingUser.id, {
        username: formData.username,
        password: formData.password,
        clientId: formData.clientId,
        status: formData.status,
      })

      await loadData()

      toast({
        title: "Usuario actualizado",
        description: `Usuario "${formData.username}" actualizado exitosamente`,
      })

      resetForm()
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el usuario",
        variant: "destructive",
      })
    }
  }

  const startEdit = (user: any) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      password: user.password,
      clientId: user.clientId,
      status: user.status,
    })
    setShowForm(true)
  }

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId)
    return client ? client.name : "Cliente no encontrado"
  }

  const getStatusBadge = (status: string) => {
    return status === "active" ? (
      <Badge className="bg-green-100 text-green-800">Activo</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Inactivo</Badge>
    )
  }

  const getClientStatusBadge = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId)
    if (!client) return <Badge className="bg-gray-100 text-gray-800">Sin cliente</Badge>

    return client.status === "active" ? (
      <Badge className="bg-blue-100 text-blue-800">Cliente Activo</Badge>
    ) : (
      <Badge className="bg-orange-100 text-orange-800">Cliente Inactivo</Badge>
    )
  }

  const getFilterStats = () => {
    const stats = {
      all: users.length,
      byClient: {} as Record<string, number>,
      noClient: users.filter((u) => !u.clientId).length,
    }

    clients.forEach((client) => {
      stats.byClient[client.id] = users.filter((u) => u.clientId === client.id).length
    })

    return stats
  }

  const filterStats = getFilterStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <p className="text-gray-600">Crear usuarios y asignarlos a clientes</p>
          </div>
          <Link href="/admin">
            <Button variant="outline">Volver al Panel</Button>
          </Link>
        </div>

        {/* Filter and Create Button */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedClientFilter}
              onChange={(e) => setSelectedClientFilter(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-md bg-white"
            >
              <option value="all">Todos los usuarios ({filterStats.all})</option>
              <option value="no-client">Sin cliente asignado ({filterStats.noClient})</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} ({filterStats.byClient[client.id] || 0})
                </option>
              ))}
            </select>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            {showForm ? "Cancelar" : "Crear Nuevo Usuario"}
          </Button>
        </div>

        {/* Filter Results Info */}
        {selectedClientFilter !== "all" && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-blue-800 font-medium">
                {selectedClientFilter === "no-client" ? (
                  <>Mostrando {filteredUsers.length} usuarios sin cliente asignado</>
                ) : (
                  <>
                    Mostrando {filteredUsers.length} usuarios del cliente "{getClientName(selectedClientFilter)}"
                  </>
                )}
              </span>
            </div>
            <Button
              onClick={() => setSelectedClientFilter("all")}
              variant="ghost"
              size="sm"
              className="mt-2 text-blue-600 hover:text-blue-800 p-0 h-auto"
            >
              Ver todos los usuarios
            </Button>
          </div>
        )}

        {/* Create/Edit User Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingUser ? "Editar Usuario" : "Nuevo Usuario"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="username">Nombre de Usuario</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Ej: usuario_penarol"
                />
              </div>
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Contraseña del usuario"
                />
              </div>
              <div>
                <Label htmlFor="clientId">Cliente Asignado</Label>
                <select
                  id="clientId"
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Seleccionar cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} ({client.status === "active" ? "Activo" : "Inactivo"})
                    </option>
                  ))}
                </select>
              </div>
              {editingUser && (
                <div>
                  <Label htmlFor="userStatus">Estado</Label>
                  <select
                    id="userStatus"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  onClick={editingUser ? handleUpdateUser : handleCreateUser}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {editingUser ? "Actualizar Usuario" : "Crear Usuario"}
                </Button>
                <Button onClick={resetForm} variant="outline">
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Users List */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg">{user.username}</CardTitle>
                <div className="flex items-center gap-2">
                  {getStatusBadge(user.status)}
                  <Button size="sm" variant="ghost" onClick={() => startEdit(user)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <strong>Cliente:</strong> {getClientName(user.clientId)}
                  </p>
                  <div className="flex gap-1 flex-wrap">{getClientStatusBadge(user.clientId)}</div>
                  <p>
                    <strong>Contraseña:</strong> {user.password}
                  </p>
                  <p>
                    <strong>Creado:</strong>{" "}
                    {new Date(user.createdAt?.seconds * 1000 || user.createdAt).toLocaleDateString()}
                  </p>
                  {user.updatedAt && (
                    <p>
                      <strong>Actualizado:</strong>{" "}
                      {new Date(user.updatedAt?.seconds * 1000 || user.updatedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && !loading && (
          <div className="text-center py-12">
            {selectedClientFilter === "all" ? (
              <div>
                <p className="text-gray-500 text-lg">No hay usuarios creados aún</p>
                <p className="text-gray-400">Haz clic en "Crear Nuevo Usuario" para comenzar</p>
              </div>
            ) : selectedClientFilter === "no-client" ? (
              <div>
                <p className="text-gray-500 text-lg">No hay usuarios sin cliente asignado</p>
                <p className="text-gray-400">Todos los usuarios tienen un cliente asignado</p>
              </div>
            ) : (
              <div>
                <p className="text-gray-500 text-lg">
                  No hay usuarios para el cliente "{getClientName(selectedClientFilter)}"
                </p>
                <p className="text-gray-400">Crea un nuevo usuario para este cliente</p>
                <Button onClick={() => setShowForm(true)} className="mt-4 bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Usuario para este Cliente
                </Button>
              </div>
            )}
          </div>
        )}

        {clients.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
            <p className="text-yellow-800">
              <strong>Nota:</strong> Necesitas crear al menos un cliente antes de poder crear usuarios.
            </p>
            <Link href="/admin/clients">
              <Button className="mt-2 bg-yellow-600 hover:bg-yellow-700">Ir a Gestión de Clientes</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
