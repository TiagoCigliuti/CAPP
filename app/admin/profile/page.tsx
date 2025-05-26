"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUser, isAdmin, updateUser, setCurrentUser } from "@/lib/users"
import { toast } from "@/hooks/use-toast"
import { Eye, EyeOff, Save, X } from "lucide-react"
import Link from "next/link"

export default function AdminProfile() {
  const router = useRouter()
  const [currentUser, setCurrentUserState] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const user = getCurrentUser()
    if (!user || !isAdmin(user)) {
      router.push("/")
      return
    }

    setCurrentUserState(user)
    setFormData({
      username: user.username,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
    setLoading(false)
  }, [router])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validar nombre de usuario
    if (!formData.username.trim()) {
      newErrors.username = "El nombre de usuario es requerido"
    } else if (formData.username.length < 3) {
      newErrors.username = "El nombre de usuario debe tener al menos 3 caracteres"
    }

    // Validar contraseña actual si se quiere cambiar la contraseña
    if (formData.newPassword && !formData.currentPassword) {
      newErrors.currentPassword = "Ingresa tu contraseña actual para cambiarla"
    }

    // Validar nueva contraseña
    if (formData.newPassword) {
      if (formData.newPassword.length < 4) {
        newErrors.newPassword = "La nueva contraseña debe tener al menos 4 caracteres"
      }

      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Las contraseñas no coinciden"
      }
    }

    // Validar contraseña actual
    if (formData.currentPassword && formData.currentPassword !== currentUser.password) {
      newErrors.currentPassword = "La contraseña actual es incorrecta"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setSaving(true)

    try {
      const updates: any = {
        username: formData.username.trim(),
      }

      // Solo actualizar contraseña si se proporcionó una nueva
      if (formData.newPassword) {
        updates.password = formData.newPassword
      }

      await updateUser(currentUser.id, updates)

      // Actualizar usuario en localStorage
      const updatedUser = { ...currentUser, ...updates }
      setCurrentUser(updatedUser)
      setCurrentUserState(updatedUser)

      toast({
        title: "Perfil actualizado",
        description: "Tu perfil ha sido actualizado exitosamente",
      })

      // Limpiar campos de contraseña
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      username: currentUser.username,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
    setErrors({})
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Cargando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
            <p className="text-gray-600">Administrar mi cuenta y configuración</p>
          </div>
          <Link href="/admin">
            <Button variant="outline">Volver al Panel</Button>
          </Link>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-bold">{currentUser?.username?.charAt(0)?.toUpperCase()}</span>
              </div>
              <div>
                <div className="text-xl">Administrador</div>
                <div className="text-sm text-gray-500 font-normal">ID: {currentUser?.id}</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Nombre de Usuario</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className={errors.username ? "border-red-500" : ""}
              />
              {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
            </div>

            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Contraseña Actual</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  placeholder="Ingresa tu contraseña actual para cambiarla"
                  className={errors.currentPassword ? "border-red-500 pr-10" : "pr-10"}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.currentPassword && <p className="text-red-500 text-sm">{errors.currentPassword}</p>}
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva Contraseña</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  placeholder="Deja en blanco para mantener la actual"
                  className={errors.newPassword ? "border-red-500 pr-10" : "pr-10"}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.newPassword && <p className="text-red-500 text-sm">{errors.newPassword}</p>}
            </div>

            {/* Confirm Password */}
            {formData.newPassword && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirma tu nueva contraseña"
                  className={errors.confirmPassword ? "border-red-500" : ""}
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
              </div>
            )}

            {/* Account Info */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h3 className="font-semibold text-gray-900">Información de la Cuenta</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Rol:</span>
                  <span className="ml-2 font-medium">Administrador</span>
                </div>
                <div>
                  <span className="text-gray-600">Estado:</span>
                  <span className="ml-2 font-medium text-green-600">Activo</span>
                </div>
                <div>
                  <span className="text-gray-600">Creado:</span>
                  <span className="ml-2 font-medium">
                    {new Date(currentUser?.createdAt?.seconds * 1000 || currentUser?.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {currentUser?.updatedAt && (
                  <div>
                    <span className="text-gray-600">Actualizado:</span>
                    <span className="ml-2 font-medium">
                      {new Date(currentUser.updatedAt?.seconds * 1000 || currentUser.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} disabled={saving} className="bg-purple-600 hover:bg-purple-700 text-white">
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Guardando..." : "Guardar Cambios"}
              </Button>
              <Button onClick={handleCancel} variant="outline" disabled={saving}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
