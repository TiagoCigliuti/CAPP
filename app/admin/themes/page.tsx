"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUser, isAdmin } from "@/lib/users"
import { getCustomThemes, createCustomTheme, updateCustomTheme, deleteCustomTheme } from "@/lib/themes"
import { toast } from "@/hooks/use-toast"
import { Pencil, Plus, X, Palette, Trash2, ChevronUp, Search } from "lucide-react"
import Link from "next/link"

interface CustomTheme {
  id: string
  name: string
  colors: {
    primary: string
    secondary: string
    background: string
    text: string
    accent: string
    border: string
  }
  createdAt: Date
  updatedAt: Date
}

export default function ThemesManagement() {
  const router = useRouter()
  const [themes, setThemes] = useState<CustomTheme[]>([])
  const [filteredThemes, setFilteredThemes] = useState<CustomTheme[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTheme, setEditingTheme] = useState<CustomTheme | null>(null)
  const [expandedThemeId, setExpandedThemeId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    colors: {
      primary: "#3b82f6",
      secondary: "#6b7280",
      background: "#ffffff",
      text: "#111827",
      accent: "#8b5cf6",
      border: "#d1d5db",
    },
  })

  useEffect(() => {
    const user = getCurrentUser()
    if (!user || !isAdmin(user)) {
      router.push("/")
      return
    }

    loadThemes()
  }, [router])

  useEffect(() => {
    // Filtrar temas basado en el término de búsqueda
    if (searchTerm.trim() === "") {
      setFilteredThemes(themes)
    } else {
      const filtered = themes.filter(
        (theme) =>
          theme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          theme.id.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredThemes(filtered)
    }
  }, [themes, searchTerm])

  const loadThemes = async () => {
    try {
      setLoading(true)
      const themesData = await getCustomThemes()
      setThemes(themesData)
    } catch (error) {
      console.error("Error loading themes:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los temas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      colors: {
        primary: "#3b82f6",
        secondary: "#6b7280",
        background: "#ffffff",
        text: "#111827",
        accent: "#8b5cf6",
        border: "#d1d5db",
      },
    })
    setEditingTheme(null)
    setShowForm(false)
    setExpandedThemeId(null)
  }

  const handleColorChange = (colorKey: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value,
      },
    }))
  }

  const handleCreateTheme = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre del tema es requerido",
        variant: "destructive",
      })
      return
    }

    try {
      await createCustomTheme(formData.name, formData.colors)
      await loadThemes()

      toast({
        title: "Tema creado",
        description: `Tema "${formData.name}" creado exitosamente`,
      })

      resetForm()
    } catch (error) {
      console.error("Error creating theme:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el tema",
        variant: "destructive",
      })
    }
  }

  const handleUpdateTheme = async () => {
    if (!editingTheme || !formData.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre del tema es requerido",
        variant: "destructive",
      })
      return
    }

    try {
      await updateCustomTheme(editingTheme.id, {
        name: formData.name,
        colors: formData.colors,
      })
      await loadThemes()

      toast({
        title: "Tema actualizado",
        description: `Tema "${formData.name}" actualizado exitosamente`,
      })

      resetForm()
    } catch (error) {
      console.error("Error updating theme:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el tema",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTheme = async (themeId: string) => {
    try {
      await deleteCustomTheme(themeId)
      await loadThemes()

      toast({
        title: "Tema eliminado",
        description: "El tema ha sido eliminado exitosamente",
      })

      setShowDeleteConfirm(null)
      resetForm()
    } catch (error) {
      console.error("Error deleting theme:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el tema",
        variant: "destructive",
      })
    }
  }

  const startEdit = (theme: CustomTheme) => {
    setEditingTheme(theme)
    setFormData({
      name: theme.name,
      colors: theme.colors,
    })
    setExpandedThemeId(theme.id)
    setShowForm(false)
  }

  const cancelEdit = () => {
    setEditingTheme(null)
    setExpandedThemeId(null)
    setShowDeleteConfirm(null)
  }

  const getColorPreview = (colors: CustomTheme["colors"]) => {
    return (
      <div className="flex gap-1">
        {Object.entries(colors).map(([key, color]) => (
          <div
            key={key}
            className="w-4 h-4 rounded-full border border-gray-300"
            style={{ backgroundColor: color }}
            title={`${key}: ${color}`}
          />
        ))}
      </div>
    )
  }

  const ColorPicker = ({ label, colorKey, value }: { label: string; colorKey: string; value: string }) => (
    <div className="space-y-2">
      <Label htmlFor={colorKey} className="text-sm font-medium">
        {label}
      </Label>
      <div className="flex gap-2 items-center">
        <input
          type="color"
          id={colorKey}
          value={value}
          onChange={(e) => handleColorChange(colorKey, e.target.value)}
          className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
        />
        <Input
          value={value}
          onChange={(e) => handleColorChange(colorKey, e.target.value)}
          placeholder="#000000"
          className="flex-1 font-mono text-sm"
        />
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Cargando temas...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Temas</h1>
            <p className="text-gray-600">Crear y administrar temas personalizados para clientes</p>
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
              placeholder="Buscar tema por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            {showForm ? "Cancelar" : "Crear Nuevo Tema"}
          </Button>
        </div>

        {/* Search Results Info */}
        {searchTerm && (
          <div className="mb-4 text-sm text-gray-600">
            {filteredThemes.length === 0 ? (
              <span className="text-red-600">No se encontraron temas que coincidan con "{searchTerm}"</span>
            ) : (
              <span>
                Mostrando {filteredThemes.length} de {themes.length} temas
                {filteredThemes.length !== themes.length && ` para "${searchTerm}"`}
              </span>
            )}
          </div>
        )}

        {/* Create Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Nuevo Tema Personalizado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="themeName">Nombre del Tema</Label>
                    <Input
                      id="themeName"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej: Tema Peñarol, Tema Nacional"
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Colores del Tema</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <ColorPicker label="Color Primario" colorKey="primary" value={formData.colors.primary} />
                      <ColorPicker label="Color Secundario" colorKey="secondary" value={formData.colors.secondary} />
                      <ColorPicker label="Color de Fondo" colorKey="background" value={formData.colors.background} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Colores Adicionales</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <ColorPicker label="Color de Texto" colorKey="text" value={formData.colors.text} />
                      <ColorPicker label="Color de Acento" colorKey="accent" value={formData.colors.accent} />
                      <ColorPicker label="Color de Borde" colorKey="border" value={formData.colors.border} />
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">Vista Previa</h3>
                    <div
                      className="p-4 rounded-lg border-2"
                      style={{
                        backgroundColor: formData.colors.background,
                        borderColor: formData.colors.border,
                        color: formData.colors.text,
                      }}
                    >
                      <div
                        className="inline-block px-4 py-2 rounded mb-2 text-white font-medium"
                        style={{ backgroundColor: formData.colors.primary }}
                      >
                        Botón Primario
                      </div>
                      <div
                        className="inline-block px-4 py-2 rounded ml-2 text-white"
                        style={{ backgroundColor: formData.colors.secondary }}
                      >
                        Botón Secundario
                      </div>
                      <p className="mt-3">Este es un ejemplo de texto con el tema seleccionado.</p>
                      <div
                        className="inline-block px-2 py-1 rounded text-sm mt-2"
                        style={{ backgroundColor: formData.colors.accent, color: "white" }}
                      >
                        Elemento de acento
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button onClick={handleCreateTheme} className="bg-green-600 hover:bg-green-700">
                  Crear Tema
                </Button>
                <Button onClick={resetForm} variant="outline">
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Themes List */}
        <div className="grid gap-4">
          {filteredThemes.map((theme) => (
            <Card key={theme.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg flex items-center gap-3">
                  {theme.name}
                  {getColorPreview(theme.colors)}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => (expandedThemeId === theme.id ? cancelEdit() : startEdit(theme))}
                  >
                    {expandedThemeId === theme.id ? <ChevronUp className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <div>
                    <strong>ID:</strong> {theme.id}
                  </div>
                  <div>
                    <strong>Creado:</strong>{" "}
                    {new Date(theme.createdAt?.seconds * 1000 || theme.createdAt).toLocaleDateString()}
                  </div>
                  {theme.updatedAt && (
                    <div>
                      <strong>Actualizado:</strong>{" "}
                      {new Date(theme.updatedAt?.seconds * 1000 || theme.updatedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Expanded Edit Form */}
                {expandedThemeId === theme.id && editingTheme && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Palette className="w-5 h-5 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Editar Tema</h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor={`edit-name-${theme.id}`}>Nombre del Tema</Label>
                          <Input
                            id={`edit-name-${theme.id}`}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ej: Tema Peñarol"
                          />
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold">Colores Principales</h4>
                          <ColorPicker label="Color Primario" colorKey="primary" value={formData.colors.primary} />
                          <ColorPicker
                            label="Color Secundario"
                            colorKey="secondary"
                            value={formData.colors.secondary}
                          />
                          <ColorPicker
                            label="Color de Fondo"
                            colorKey="background"
                            value={formData.colors.background}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-4">
                          <h4 className="font-semibold">Colores Adicionales</h4>
                          <ColorPicker label="Color de Texto" colorKey="text" value={formData.colors.text} />
                          <ColorPicker label="Color de Acento" colorKey="accent" value={formData.colors.accent} />
                          <ColorPicker label="Color de Borde" colorKey="border" value={formData.colors.border} />
                        </div>

                        {/* Preview */}
                        <div className="mt-4">
                          <h4 className="font-semibold mb-3">Vista Previa</h4>
                          <div
                            className="p-3 rounded border-2 text-sm"
                            style={{
                              backgroundColor: formData.colors.background,
                              borderColor: formData.colors.border,
                              color: formData.colors.text,
                            }}
                          >
                            <div
                              className="inline-block px-3 py-1 rounded mb-2 text-white text-xs"
                              style={{ backgroundColor: formData.colors.primary }}
                            >
                              Primario
                            </div>
                            <div
                              className="inline-block px-3 py-1 rounded ml-2 text-white text-xs"
                              style={{ backgroundColor: formData.colors.secondary }}
                            >
                              Secundario
                            </div>
                            <p className="mt-2 text-xs">Texto de ejemplo</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Delete Confirmation */}
                    {showDeleteConfirm === theme.id && (
                      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Trash2 className="w-5 h-5 text-red-600" />
                          <h4 className="font-semibold text-red-900">¿Eliminar tema?</h4>
                        </div>
                        <p className="text-red-800 text-sm mb-4">
                          Esta acción eliminará permanentemente el tema "{theme.name}". Los clientes que usen este tema
                          volverán al tema por defecto.
                        </p>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleDeleteTheme(theme.id)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            size="sm"
                          >
                            Sí, eliminar tema
                          </Button>
                          <Button onClick={() => setShowDeleteConfirm(null)} variant="outline" size="sm">
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-6 pt-4 border-t border-gray-200">
                      <Button onClick={handleUpdateTheme} className="bg-green-600 hover:bg-green-700">
                        Actualizar Tema
                      </Button>
                      <Button
                        onClick={() => setShowDeleteConfirm(theme.id)}
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar Tema
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

        {filteredThemes.length === 0 && !loading && (
          <div className="text-center py-12">
            {searchTerm ? (
              <div>
                <p className="text-gray-500 text-lg mb-2">No se encontraron temas</p>
                <p className="text-gray-400">Intenta con un término de búsqueda diferente</p>
                <Button onClick={() => setSearchTerm("")} variant="outline" className="mt-4">
                  Limpiar búsqueda
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-gray-500 text-lg">No hay temas personalizados creados aún</p>
                <p className="text-gray-400">Haz clic en "Crear Nuevo Tema" para comenzar</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
