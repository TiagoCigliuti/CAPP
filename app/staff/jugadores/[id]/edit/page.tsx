"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Trash2 } from "lucide-react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import Link from "next/link"
import { obtenerJugador, actualizarJugador, eliminarJugador } from "@/lib/firestoreHelpers"
import { clubThemes, getCurrentTheme } from "@/lib/themes"
import { toast } from "@/hooks/use-toast"

export default function EditarJugador() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [theme, setTheme] = useState(clubThemes.default)
  const [posicionesGuardadas, setPosicionesGuardadas] = useState<string[]>([])

  // Estados del formulario
  const [nombre, setNombre] = useState("")
  const [apellidos, setApellidos] = useState("")
  const [nombreId, setNombreId] = useState("")
  const [nroDocumento, setNroDocumento] = useState("")
  const [fechaNacimiento, setFechaNacimiento] = useState<Date | null>(null)
  const [posicionPrincipal, setPosicionPrincipal] = useState("")
  const [nuevaPosicion, setNuevaPosicion] = useState("")
  const [altura, setAltura] = useState("")
  const [peso, setPeso] = useState("")
  const [nombreUsuario, setNombreUsuario] = useState("")
  const [contrasena, setContrasena] = useState("")
  const [estadoUsuario, setEstadoUsuario] = useState<"active" | "inactive">("active")
  const [fotoBase64, setFotoBase64] = useState<string | null>(null)
  const [perfilHabil, setPerfilHabil] = useState<"izquierdo" | "derecho" | "">("") // Nuevo campo

  useEffect(() => {
    const currentTheme = getCurrentTheme()
    setTheme(clubThemes[currentTheme])
  }, [])

  // Cargar posiciones guardadas del localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("posiciones-guardadas")
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setPosicionesGuardadas(parsed)
        } catch (error) {
          console.error("Error parsing stored positions:", error)
        }
      }
    }
  }, [])

  useEffect(() => {
    const cargarJugador = async () => {
      try {
        const data = await obtenerJugador(id)
        if (data) {
          setNombre(data.nombre || "")
          setApellidos(data.apellidos || "")
          setNombreId(data.nombreId || "")
          setNroDocumento(data.nroDocumento || "")
          setFechaNacimiento(data.fechaNacimiento ? new Date(data.fechaNacimiento) : null)
          setPosicionPrincipal(data.posicionPrincipal || "")
          setAltura(data.altura?.toString() || "")
          setPeso(data.peso?.toString() || "")
          setNombreUsuario(data.nombreUsuario || "")
          setContrasena(data.contrasena || "")
          setEstadoUsuario(data.estadoUsuario || "active")
          setFotoBase64(data.foto || null)
          setPerfilHabil(data.perfilHabil || "")
        }
      } catch (error) {
        console.error("Error al cargar jugador:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la información del jugador",
          variant: "destructive",
        })
      } finally {
        setCargando(false)
      }
    }

    if (id) {
      cargarJugador()
    }
  }, [id])

  // Manejar carga de imagen
  const manejarFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0]
    if (archivo) {
      const lector = new FileReader()
      lector.onload = () => {
        setFotoBase64(lector.result as string)
      }
      lector.readAsDataURL(archivo)
    }
  }

  // Agregar nueva posición
  const agregarNuevaPosicion = () => {
    if (nuevaPosicion && !posicionesGuardadas.includes(nuevaPosicion)) {
      const nuevasPosiciones = [...posicionesGuardadas, nuevaPosicion]
      setPosicionesGuardadas(nuevasPosiciones)
      setPosicionPrincipal(nuevaPosicion)
      setNuevaPosicion("")

      // Guardar en localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("posiciones-guardadas", JSON.stringify(nuevasPosiciones))
      }
    }
  }

  // Validar formulario
  const validarFormulario = () => {
    if (!nombre.trim()) {
      toast({ title: "Error", description: "El nombre es requerido", variant: "destructive" })
      return false
    }
    if (!apellidos.trim()) {
      toast({ title: "Error", description: "Los apellidos son requeridos", variant: "destructive" })
      return false
    }
    return true
  }

  // Guardar cambios
  const guardarCambios = async () => {
    if (!validarFormulario()) {
      return
    }

    setGuardando(true)

    const datosActualizados = {
      nombre: nombre.trim(),
      apellidos: apellidos.trim(),
      nombreId: nombreId.trim(),
      nroDocumento: nroDocumento.trim(),
      fechaNacimiento: fechaNacimiento?.toISOString().split("T")[0] || "",
      posicionPrincipal: posicionPrincipal.trim(),
      perfilHabil,
      altura: altura ? Number.parseFloat(altura) : 0,
      peso: peso ? Number.parseFloat(peso) : 0,
      nombreUsuario: nombreUsuario.trim(),
      contrasena: contrasena.trim(),
      estadoUsuario,
      foto: fotoBase64,
    }

    try {
      await actualizarJugador(id, datosActualizados)

      // Agregar posición a la lista si es nueva
      if (posicionPrincipal && !posicionesGuardadas.includes(posicionPrincipal)) {
        const nuevasPosiciones = [...posicionesGuardadas, posicionPrincipal]
        setPosicionesGuardadas(nuevasPosiciones)
        if (typeof window !== "undefined") {
          localStorage.setItem("posiciones-guardadas", JSON.stringify(nuevasPosiciones))
        }
      }

      toast({
        title: "Éxito",
        description: "Jugador actualizado correctamente",
      })

      router.push(`/staff/jugadores/${id}`)
    } catch (error) {
      console.error("Error al actualizar jugador:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el jugador",
        variant: "destructive",
      })
    } finally {
      setGuardando(false)
    }
  }

  // Eliminar jugador
  const eliminarJugadorConfirm = async () => {
    if (confirm("¿Estás seguro de que quieres eliminar este jugador? Esta acción no se puede deshacer.")) {
      try {
        await eliminarJugador(id)
        toast({
          title: "Éxito",
          description: "Jugador eliminado correctamente",
        })
        router.push("/staff/jugadores")
      } catch (error) {
        console.error("Error al eliminar jugador:", error)
        toast({
          title: "Error",
          description: "No se pudo eliminar el jugador",
          variant: "destructive",
        })
      }
    }
  }

  if (cargando) {
    return (
      <div className={`min-h-screen ${theme.bgColor} ${theme.textColor} p-4`}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos del jugador...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${theme.bgColor} ${theme.textColor} p-4`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <Link href={`/staff/jugadores/${id}`}>
          <Button variant="outline" className={`${theme.borderColor} ${theme.textColor} hover:bg-gray-100`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
        </Link>
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-2">
            <span className="text-white text-xl font-bold">SD</span>
          </div>
          <h1 className={`text-2xl font-bold text-center ${theme.textColor}`}>Editar Jugador</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={guardarCambios} disabled={guardando} className={`${theme.primaryColor} text-white`}>
            <Save className="w-4 h-4 mr-2" />
            {guardando ? "Guardando..." : "Guardar"}
          </Button>
          <Button onClick={eliminarJugadorConfirm} variant="destructive" className="bg-red-600 hover:bg-red-700">
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Información del Jugador</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Información Personal */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 border-b pb-2">Información Personal</h3>

                <div>
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    placeholder="Nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className={`bg-white border ${theme.borderColor} text-gray-900`}
                  />
                </div>

                <div>
                  <Label htmlFor="apellidos">Apellidos *</Label>
                  <Input
                    id="apellidos"
                    placeholder="Apellidos"
                    value={apellidos}
                    onChange={(e) => setApellidos(e.target.value)}
                    className={`bg-white border ${theme.borderColor} text-gray-900`}
                  />
                </div>

                <div>
                  <Label htmlFor="nombreId">Nombre ID</Label>
                  <Input
                    id="nombreId"
                    placeholder="Nombre ID"
                    value={nombreId}
                    onChange={(e) => setNombreId(e.target.value)}
                    className={`bg-white border ${theme.borderColor} text-gray-900`}
                  />
                </div>

                <div>
                  <Label htmlFor="nroDocumento">Nro. Documento</Label>
                  <Input
                    id="nroDocumento"
                    placeholder="Número de documento"
                    value={nroDocumento}
                    onChange={(e) => setNroDocumento(e.target.value)}
                    className={`bg-white border ${theme.borderColor} text-gray-900`}
                  />
                </div>

                <div>
                  <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                  <DatePicker
                    selected={fechaNacimiento}
                    onChange={(date) => setFechaNacimiento(date)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Seleccionar fecha"
                    className={`w-full p-2 border ${theme.borderColor} rounded-md bg-white text-gray-900`}
                    showYearDropdown
                    yearDropdownItemNumber={50}
                    scrollableYearDropdown
                  />
                </div>
              </div>

              {/* Información Deportiva */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 border-b pb-2">Información Deportiva</h3>

                <div>
                  <Label htmlFor="posicionPrincipal">Posición Principal</Label>
                  <select
                    id="posicionPrincipal"
                    value={posicionPrincipal}
                    onChange={(e) => setPosicionPrincipal(e.target.value)}
                    className={`w-full p-2 border ${theme.borderColor} rounded-md bg-white text-gray-900`}
                  >
                    <option value="">Seleccionar posición</option>
                    {posicionesGuardadas.map((pos, i) => (
                      <option key={i} value={pos}>
                        {pos}
                      </option>
                    ))}
                    <option value="nueva">Agregar nueva posición...</option>
                  </select>
                </div>

                {posicionPrincipal === "nueva" && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nueva posición"
                      value={nuevaPosicion}
                      onChange={(e) => setNuevaPosicion(e.target.value)}
                      className={`bg-white border ${theme.borderColor} text-gray-900`}
                    />
                    <Button onClick={agregarNuevaPosicion} className={`${theme.primaryColor} text-white`}>
                      Agregar
                    </Button>
                  </div>
                )}

                <div>
                  <Label htmlFor="perfilHabil">Perfil Hábil</Label>
                  <select
                    id="perfilHabil"
                    value={perfilHabil}
                    onChange={(e) => setPerfilHabil(e.target.value as "izquierdo" | "derecho" | "")}
                    className={`w-full p-2 border ${theme.borderColor} rounded-md bg-white text-gray-900`}
                  >
                    <option value="">Seleccionar perfil</option>
                    <option value="izquierdo">Izquierdo</option>
                    <option value="derecho">Derecho</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="altura">Altura (cm)</Label>
                  <Input
                    id="altura"
                    type="number"
                    placeholder="Ej: 180"
                    value={altura}
                    onChange={(e) => setAltura(e.target.value)}
                    className={`bg-white border ${theme.borderColor} text-gray-900`}
                  />
                </div>

                <div>
                  <Label htmlFor="peso">Peso (kg)</Label>
                  <Input
                    id="peso"
                    type="number"
                    step="0.1"
                    placeholder="Ej: 75.5"
                    value={peso}
                    onChange={(e) => setPeso(e.target.value)}
                    className={`bg-white border ${theme.borderColor} text-gray-900`}
                  />
                </div>

                <div>
                  <Label htmlFor="foto">Foto del jugador</Label>
                  <input
                    id="foto"
                    type="file"
                    accept="image/*"
                    onChange={manejarFoto}
                    className="w-full text-gray-700"
                  />
                  {fotoBase64 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-1">Vista previa:</p>
                      <img
                        src={fotoBase64 || "/placeholder.svg"}
                        alt="Vista previa"
                        className="w-20 h-20 object-cover rounded-full border-2 border-blue-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Acceso al Sistema */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 border-b pb-2">Acceso al Sistema</h3>

                <div>
                  <Label htmlFor="nombreUsuario">Nombre de Usuario</Label>
                  <Input
                    id="nombreUsuario"
                    placeholder="Nombre de usuario"
                    value={nombreUsuario}
                    onChange={(e) => setNombreUsuario(e.target.value)}
                    className={`bg-white border ${theme.borderColor} text-gray-900`}
                  />
                </div>

                <div>
                  <Label htmlFor="contrasena">Contraseña</Label>
                  <Input
                    id="contrasena"
                    type="password"
                    placeholder="Contraseña"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    className={`bg-white border ${theme.borderColor} text-gray-900`}
                  />
                </div>

                <div>
                  <Label htmlFor="estadoUsuario">Estado del Usuario</Label>
                  <select
                    id="estadoUsuario"
                    value={estadoUsuario}
                    onChange={(e) => setEstadoUsuario(e.target.value as "active" | "inactive")}
                    className={`w-full p-2 border ${theme.borderColor} rounded-md bg-white text-gray-900`}
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-yellow-800 text-sm">
                    <strong>⚠️ Advertencia:</strong> Al eliminar este jugador se perderán todos sus datos y no podrá
                    acceder más a la aplicación.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
