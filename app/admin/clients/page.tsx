"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { getCurrentUser, isAdmin, getClients, createClient, updateClient } from "@/lib/users"
import { eliminarCliente } from "@/lib/firestoreHelpers"
import { clubThemes } from "@/lib/themes"
import { STAFF_MODULES, getDefaultEnabledModules } from "@/lib/staffModules"
import { toast } from "@/hooks/use-toast"
import { Pencil, Plus, X, Settings, Search, Trash2, ChevronUp } from "lucide-react"
import Link from "next/link"

export default function ClientsManagement() {
  const router = useRouter()
  const [clients, setClients] = useState<any[]>([])
  const [filteredClients, setFilteredClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingClient, setEditingClient] = useState<any>(null)
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    theme: "default",
    status: "active" as "active" | "inactive",
    enabledModules: getDefaultEnabledModules(),
  })

  useEffect(() => {
    const user = getCurrentUser()
    if (!user || !isAdmin(user)) {
      router.push("/")
      return
    }

    loadClients()
  }, [router])

  useEffect(() => {
    // Filtrar clientes basado en el término de búsqueda
    if (searchTerm.trim() === "") {
      setFilteredClients(clients)
    } else {
      const filtered = clients.filter(
        (client) =>
          client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.id.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredClients(filtered)
    }
  }, [clients, searchTerm])

  const loadClients = async () => {
    try {
      setLoading(true)
      const clientsData = await getClients()
      setClients(clientsData)
    } catch (error) {
      console.error("Error loading clients:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los clientes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      theme: "default",
      status: "active",
      enabledModules: getDefaultEnabledModules(),
    })
    setEditingClient(null)
    setShowForm(false)
    setExpandedClientId(null)
  }

  const handleModuleToggle = (moduleId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      enabledModules: checked
        ? [...prev.enabledModules, moduleId]
        : prev.enabledModules.filter((id) => id !== moduleId),
    }))
  }

  const handleCreateClient = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre del cliente es requerido",
        variant: "destructive",
      })
      return
    }

    if (formData.enabledModules.length === 0) {
      toast({
        title: "Error",
        description: "Debe seleccionar al menos un módulo",
        variant: "destructive",
      })
      return
    }

    try {
      const logo = formData.theme === "penarol" ? "/penarol-white-bg.png" : undefined
      await createClient(formData.name, formData.theme, logo, formData.enabledModules)
      await loadClients()

      toast({
        title: "Cliente creado",
        description: `Cliente "${formData.name}" creado exitosamente`,
      })

      resetForm()
    } catch (error) {
      console.error("Error creating client:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el cliente",
        variant: "destructive",
      })
    }
  }

  const handleUpdateClient = async () => {
    if (!editingClient || !formData.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre del cliente es requerido",
        variant: "destructive",
      })
      return
    }

    if (formData.enabledModules.length === 0) {
      toast({
        title: "Error",
        description: "Debe seleccionar al menos un módulo",
        variant: "destructive",
      })
      return
    }

    try {
      const updates: any = {
        name: formData.name,
        theme: formData.theme,
        status: formData.status,
        enabledModules: formData.enabledModules,
      }

      if (formData.theme === "penarol") {
        updates.logo = "/penarol-white-bg.png"
      } else if (formData.theme === "nacional") {
        updates.logo = "/logos/nacional.png"
      }

      await updateClient(editingClient.id, updates)
      await loadClients()

      toast({
        title: "Cliente actualizado",
        description: `Cliente "${formData.name}" actualizado exitosamente`,
      })

      if (formData.status === "inactive") {
        toast({
          title: "Usuarios desactivados",
          description: "Todos los usuarios de este cliente han sido desactivados",
        })
      }

      resetForm()
    } catch (error) {
      console.error("Error updating client:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el cliente",
        variant: "destructive",
      })
    }
  }

  const handleDeleteClient = async (clientId: string) => {
    try {
      await eliminarCliente(clientId)
      await loadClients()

      toast({
        title: "Cliente eliminado",
        description: "El cliente ha sido eliminado exitosamente",
      })

      setShowDeleteConfirm(null)
      resetForm()
    } catch (error) {
      console.error("Error deleting client:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el cliente",
        variant: "destructive",
      })
    }
  }

  const startEdit = (client: any) => {
    setEditingClient(client)
    setFormData({
      name: client.name,
      theme: client.theme,
      status: client.status,
      enabledModules: client.enabledModules || getDefaultEnabledModules(),
    })
    setExpandedClientId(client.id)
    setShowForm(false) // Cerrar el formulario de crear si está abierto
  }

  const cancelEdit = () => {
    setEditingClient(null)
    setExpandedClientId(null)
    setShowDeleteConfirm(null)
  }

  const getStatusBadge = (status: string) => {
    return status === "active" ? (
      <Badge className="bg-green-100 text-green-800">Activo</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Inactivo</Badge>
    )
  }

  const getModuleBadges = (enabledModules: string[] = []) => {
    return enabledModules
      .map((moduleId) => {
        const module = STAFF_MODULES.find((m) => m.id === moduleId)
        return module ? (
          <Badge key={moduleId} variant="outline" className="text-xs">
            {module.icon} {module.name}
          </Badge>
        ) : null
      })
      .filter(Boolean)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Cargando clientes...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
            <p className="text-gray-600">Crear y administrar clientes del sistema</p>
          </div>
          <Link href="/admin">
            <Button variant="outline">Volver al Panel</Button>
          </Link>
        </div>

        {/* Search and Create Button */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar cliente por nombre o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            {showForm ? "Cancelar" : "Crear Nuevo Cliente"}
          </Button>
        </div>

        {/* Search Results Info */}
        {searchTerm && (
          <div className="mb-4 text-sm text-gray-600">
            {filteredClients.length === 0 ? (
              <span className="text-red-600">No se encontraron clientes que coincidan con "{searchTerm}"</span>
            ) : (
              <span>
                Mostrando {filteredClients.length} de {clients.length} clientes
                {filteredClients.length !== clients.length && ` para "${searchTerm}"`}
              </span>
            )}
          </div>
        )}

        {/* Create Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Nuevo Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="clientName">Nombre del Cliente</Label>
                    <Input
                      id="clientName"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej: Club Atlético Peñarol"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientTheme">Tema</Label>
                    <select
                      id="clientTheme"
                      value={formData.theme}
                      onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      {Object.keys(clubThemes).map((theme) => (
                        <option key={theme} value={theme}>
                          {theme === "default" ? "Genérico" : theme.charAt(0).toUpperCase() + theme.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold">Módulos del Panel de Staff</Label>
                  <p className="text-sm text-gray-600 mb-4">
                    Selecciona qué funcionalidades estarán disponibles para este cliente
                  </p>
                  <div className="space-y-3 max-h-64 overflow-y-auto border border-gray-200 rounded-md p-3">
                    {STAFF_MODULES.map((module) => (
                      <div key={module.id} className="flex items-start space-x-3">
                        <Checkbox
                          id={module.id}
                          checked={formData.enabledModules.includes(module.id)}
                          onCheckedChange={(checked) => handleModuleToggle(module.id, checked as boolean)}
                        />
                        <div className="flex-1 min-w-0">
                          <label
                            htmlFor={module.id}
                            className="text-sm font-medium text-gray-900 cursor-pointer flex items-center gap-2"
                          >
                            <span>{module.icon}</span>
                            {module.name}
                          </label>
                          <p className="text-xs text-gray-500">{module.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Módulos seleccionados: {formData.enabledModules.length} de {STAFF_MODULES.length}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button onClick={handleCreateClient} className="bg-green-600 hover:bg-green-700">
                  Crear Cliente
                </Button>
                <Button onClick={resetForm} variant="outline">
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Clients List */}
        <div className="grid gap-4">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg">{client.name}</CardTitle>
                <div className="flex items-center gap-2">
                  {getStatusBadge(client.status)}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => (expandedClientId === client.id ? cancelEdit() : startEdit(client))}
                  >
                    {expandedClientId === client.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <Pencil className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <div>
                    <strong>ID:</strong> {client.id}
                  </div>
                  <div>
                    <strong>Tema:</strong> {client.theme}
                  </div>
                  <div>
                    <strong>Módulos habilitados:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">{getModuleBadges(client.enabledModules)}</div>
                    {(!client.enabledModules || client.enabledModules.length === 0) && (
                      <span className="text-orange-600 text-xs">⚠️ Sin módulos configurados</span>
                    )}
                  </div>
                  <div>
                    <strong>Creado:</strong>{" "}
                    {new Date(client.createdAt?.seconds * 1000 || client.createdAt).toLocaleDateString()}
                  </div>
                  {client.updatedAt && (
                    <div>
                      <strong>Actualizado:</strong>{" "}
                      {new Date(client.updatedAt?.seconds * 1000 || client.updatedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Expanded Edit Form */}
                {expandedClientId === client.id && editingClient && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Settings className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Editar Cliente</h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor={`edit-name-${client.id}`}>Nombre del Cliente</Label>
                          <Input
                            id={`edit-name-${client.id}`}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ej: Club Atlético Peñarol"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`edit-theme-${client.id}`}>Tema</Label>
                          <select
                            id={`edit-theme-${client.id}`}
                            value={formData.theme}
                            onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          >
                            {Object.keys(clubThemes).map((theme) => (
                              <option key={theme} value={theme}>
                                {theme === "default" ? "Genérico" : theme.charAt(0).toUpperCase() + theme.slice(1)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label htmlFor={`edit-status-${client.id}`}>Estado</Label>
                          <select
                            id={`edit-status-${client.id}`}
                            value={formData.status}
                            onChange={(e) =>
                              setFormData({ ...formData, status: e.target.value as "active" | "inactive" })
                            }
                            className="w-full p-2 border border-gray-300 rounded-md"
                          >
                            <option value="active">Activo</option>
                            <option value="inactive">Inactivo</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <Label className="text-base font-semibold">Módulos del Panel de Staff</Label>
                        <p className="text-sm text-gray-600 mb-4">Selecciona qué funcionalidades estarán disponibles</p>
                        <div className="space-y-3 max-h-64 overflow-y-auto border border-gray-200 rounded-md p-3">
                          {STAFF_MODULES.map((module) => (
                            <div key={module.id} className="flex items-start space-x-3">
                              <Checkbox
                                id={`edit-${module.id}-${client.id}`}
                                checked={formData.enabledModules.includes(module.id)}
                                onCheckedChange={(checked) => handleModuleToggle(module.id, checked as boolean)}
                              />
                              <div className="flex-1 min-w-0">
                                <label
                                  htmlFor={`edit-${module.id}-${client.id}`}
                                  className="text-sm font-medium text-gray-900 cursor-pointer flex items-center gap-2"
                                >
                                  <span>{module.icon}</span>
                                  {module.name}
                                </label>
                                <p className="text-xs text-gray-500">{module.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Módulos seleccionados: {formData.enabledModules.length} de {STAFF_MODULES.length}
                        </p>
                      </div>
                    </div>

                    {/* Delete Confirmation */}
                    {showDeleteConfirm === client.id && (
                      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Trash2 className="w-5 h-5 text-red-600" />
                          <h4 className="font-semibold text-red-900">¿Eliminar cliente?</h4>
                        </div>
                        <p className="text-red-800 text-sm mb-4">
                          Esta acción eliminará permanentemente el cliente "{client.name}" y todos sus datos asociados.
                          Esta acción no se puede deshacer.
                        </p>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleDeleteClient(client.id)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            size="sm"
                          >
                            Sí, eliminar cliente
                          </Button>
                          <Button onClick={() => setShowDeleteConfirm(null)} variant="outline" size="sm">
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-6 pt-4 border-t border-gray-200">
                      <Button onClick={handleUpdateClient} className="bg-green-600 hover:bg-green-700">
                        Actualizar Cliente
                      </Button>
                      <Button
                        onClick={() => setShowDeleteConfirm(client.id)}
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar Cliente
                      </Button>
                      <Button onClick={cancelEdit} variant="outline">
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredClients.length === 0 && !loading && (
          <div className="text-center py-12">
            {searchTerm ? (
              <div>
                <p className="text-gray-500 text-lg mb-2">No se encontraron clientes</p>
                <p className="text-gray-400">Intenta con un término de búsqueda diferente</p>
                <Button onClick={() => setSearchTerm("")} variant="outline" className="mt-4">
                  Limpiar búsqueda
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-gray-500 text-lg">No hay clientes creados aún</p>
                <p className="text-gray-400">Haz clic en "Crear Nuevo Cliente" para comenzar</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
