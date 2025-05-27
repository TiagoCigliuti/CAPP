"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import Link from "next/link"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { Edit, Search, Filter } from "lucide-react"
import { agregarJugador, obtenerJugadores, eliminarJugador as eliminarJugadorFirebase } from "@/lib/firestoreHelpers"
import { useTheme } from "@/hooks/useTheme"
import { getCurrentUser, getCurrentClient, createUser } from "@/lib/users"
import { toast } from "@/hooks/use-toast"

// Función para calcular la edad
const calcularEdad = (fechaNacimiento: string) => {
  const hoy = new Date()
  const nacimiento = new Date(fechaNacimiento)
  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const mes = hoy.getMonth() - nacimiento.getMonth()

  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--
  }

  return edad
}

export default function GestionJugadores() {
  const router = useRouter()
  const [jugadores, setJugadores] = useState<any[]>([])
  const [jugadoresFiltrados, setJugadoresFiltrados] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [currentClient, setCurrentClient] = useState<any>(null)
  const [posicionesGuardadas, setPosicionesGuardadas] = useState<string[]>([])

  // Usar el hook useTheme con verificación de seguridad
  const themeData = useTheme()
  const safeTheme = {
    bgColor: themeData?.bgColor || "bg-white",
    textColor: themeData?.textColor || "text-gray-900",
    primaryColor: themeData?.primaryColor || "bg-blue-600 hover:bg-blue-700",
    secondaryColor: themeData?.secondaryColor || "bg-gray-800 hover:bg-gray-700",
    accentColor: themeData?.accentColor || "bg-gray-600 hover:bg-gray-500",
    borderColor: themeData?.borderColor || "border-gray-300",
    cardBg: themeData?.cardBg || "bg-gray-50",
    logo: themeData?.logo || null,
    clubName: themeData?.clubName || "Sistema Deportivo",
  }

  // Estados de búsqueda y filtros
  const [busqueda, setBusqueda] = useState("")
  const [filtroEstado, setFiltroEstado] = useState<"all" | "active" | "inactive">("active")
  const [filtroPosicion, setFiltroPosicion] = useState<string>("all")

  // Formulario expandido
  const [nombre, setNombre] = useState("")
  const [apellidos, setApellidos] = useState("")
  const [nombreId, setNombreId] = useState("")
  const [nroDocumento, setNroDocumento] = useState("")
  const [fechaNacimiento, setFechaNacimiento] = useState<Date | null>(null)
  const [posicionPrincipal, setPosicionPrincipal] = useState("")
  const [perfilHabil, setPerfilHabil] = useState<"izquierdo" | "derecho" | "">("") // Nuevo campo
  const [nuevaPosicion, setNuevaPosicion] = useState("")
  const [altura, setAltura] = useState("")
  const [peso, setPeso] = useState("")
  const [nombreUsuario, setNombreUsuario] = useState("")
  const [contrasena, setContrasena] = useState("")
  const [estadoUsuario, setEstadoUsuario] = useState<"active" | "inactive">("active")
  const [fotoBase64, setFotoBase64] = useState<string | null>(null)

  // Cargar jugadores y posiciones guardadas
  useEffect(() => {
    async function cargar() {
      try {
        const user = getCurrentUser()
        if (!user) {
          router.push("/")
          return
        }

        const client = await getCurrentClient()
        setCurrentClient(client)

        if (client) {
          // Cargar jugadores del cliente actual
          const data = await obtenerJugadores(client.id)
          setJugadores(data)
          setError(null)

          // Extraer posiciones únicas de los jugadores existentes
          const posiciones = [...new Set(data.map((j: any) => j.posicionPrincipal).filter(Boolean))]
          setPosicionesGuardadas(posiciones)
        } else {
          setError("No se pudo identificar el cliente actual")
          setJugadores([])
        }
      } catch (err) {
        console.error("Error al cargar jugadores:", err)
        setError("No se pudieron cargar los jugadores. Error de permisos en Firebase.")
        setJugadores([])
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [router])

  // Aplicar filtros y búsqueda
  useEffect(() => {
    let resultado = [...jugadores]

    // Filtro por búsqueda (nombre)
    if (busqueda.trim()) {
      resultado = resultado.filter((jugador) =>
        `${jugador.nombre} ${jugador.apellidos}`.toLowerCase().includes(busqueda.toLowerCase()),
      )
    }

    // Filtro por estado
    if (filtroEstado !== "all") {
      resultado = resultado.filter((jugador) => jugador.estadoUsuario === filtroEstado)
    }

    // Filtro por posición
    if (filtroPosicion !== "all") {
      resultado = resultado.filter((jugador) => jugador.posicionPrincipal === filtroPosicion)
    }

    setJugadoresFiltrados(resultado)
  }, [jugadores, busqueda, filtroEstado, filtroPosicion])

  // Cargar posiciones guardadas del localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("posiciones-guardadas")
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setPosicionesGuardadas((prev) => [...new Set([...prev, ...parsed])])
        } catch (error) {
          console.error("Error parsing stored positions:", error)
        }
      }
    }
  }, [])

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
    if (!nombreId.trim()) {
      toast({ title: "Error", description: "El nombre ID es requerido", variant: "destructive" })
      return false
    }
    if (!nroDocumento.trim()) {
      toast({ title: "Error", description: "El número de documento es requerido", variant: "destructive" })
      return false
    }
    if (!fechaNacimiento) {
      toast({ title: "Error", description: "La fecha de nacimiento es requerida", variant: "destructive" })
      return false
    }
    if (!posicionPrincipal.trim()) {
      toast({ title: "Error", description: "La posición principal es requerida", variant: "destructive" })
      return false
    }
    if (!perfilHabil) {
      toast({ title: "Error", description: "El perfil hábil es requerido", variant: "destructive" })
      return false
    }
    if (!altura.trim()) {
      toast({ title: "Error", description: "La altura es requerida", variant: "destructive" })
      return false
    }
    if (!peso.trim()) {
      toast({ title: "Error", description: "El peso es requerido", variant: "destructive" })
      return false
    }
    if (!nombreUsuario.trim()) {
      toast({ title: "Error", description: "El nombre de usuario es requerido", variant: "destructive" })
      return false
    }
    if (!contrasena.trim()) {
      toast({ title: "Error", description: "La contraseña es requerida", variant: "destructive" })
      return false
    }

    // Validar que el nombre de usuario no exista
    const usuarioExiste = jugadores.some((j) => j.nombreUsuario === nombreUsuario.trim())
    if (usuarioExiste) {
      toast({ title: "Error", description: "El nombre de usuario ya existe", variant: "destructive" })
      return false
    }

    return true
  }

  // Guardar jugador
  const guardarJugador = async () => {
    if (!validarFormulario() || !currentClient) {
      return
    }

    const nuevoJugador = {
      nombre: nombre.trim(),
      apellidos: apellidos.trim(),
      nombreId: nombreId.trim(),
      nroDocumento: nroDocumento.trim(),
      fechaNacimiento: fechaNacimiento!.toISOString().split("T")[0],
      posicionPrincipal: posicionPrincipal.trim(),
      perfilHabil, // Nuevo campo
      altura: Number.parseFloat(altura),
      peso: Number.parseFloat(peso),
      nombreUsuario: nombreUsuario.trim(),
      contrasena: contrasena.trim(),
      estadoUsuario,
      foto: fotoBase64,
    }

    try {
      // Crear el jugador
      const docRef = await agregarJugador(nuevoJugador, currentClient.id)

      // Crear el usuario para el jugador
      try {
        await createUser(nombreUsuario.trim(), contrasena.trim(), currentClient.id, "jugador")
        toast({
          title: "Éxito",
          description: "Jugador y usuario creados exitosamente",
        })
      } catch (userError) {
        console.error("Error creating user for player:", userError)
        toast({
          title: "Advertencia",
          description: "Jugador creado, pero hubo un error al crear el usuario",
          variant: "destructive",
        })
      }

      // Actualizar lista local
      setJugadores((prev) => [
        ...prev,
        { id: docRef?.id || `temp-${Date.now()}`, ...nuevoJugador, clientId: currentClient.id },
      ])

      // Agregar posición a la lista si es nueva
      if (!posicionesGuardadas.includes(posicionPrincipal)) {
        const nuevasPosiciones = [...posicionesGuardadas, posicionPrincipal]
        setPosicionesGuardadas(nuevasPosiciones)
        if (typeof window !== "undefined") {
          localStorage.setItem("posiciones-guardadas", JSON.stringify(nuevasPosiciones))
        }
      }

      setError(null)
      resetFormulario()
    } catch (err) {
      console.error("Error al guardar jugador:", err)
      setError("No se pudo guardar el jugador. Error de permisos en Firebase.")

      // En modo desarrollo, simular éxito
      if (process.env.NODE_ENV === "development") {
        setJugadores((prev) => [...prev, { id: `temp-${Date.now()}`, ...nuevoJugador, clientId: currentClient.id }])
        resetFormulario()
        toast({
          title: "Éxito (modo desarrollo)",
          description: "Jugador creado exitosamente",
        })
      }
    }
  }

  // Reset formulario
  const resetFormulario = () => {
    setNombre("")
    setApellidos("")
    setNombreId("")
    setNroDocumento("")
    setFechaNacimiento(null)
    setPosicionPrincipal("")
    setPerfilHabil("") // Nuevo campo
    setAltura("")
    setPeso("")
    setNombreUsuario("")
    setContrasena("")
    setEstadoUsuario("active")
    setFotoBase64(null)
    setMostrarFormulario(false)
  }

  // Eliminar jugador
  const eliminarJugador = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este jugador?")) {
      try {
        await eliminarJugadorFirebase(id)
        setJugadores((prev) => prev.filter((j) => j.id !== id))
        setError(null)
        toast({ title: "Éxito", description: "Jugador eliminado exitosamente" })
      } catch (err) {
        console.error("Error al eliminar jugador:", err)
        setError("No se pudo eliminar el jugador. Error de permisos en Firebase.")

        // En modo desarrollo, simular éxito
        if (process.env.NODE_ENV === "development") {
          setJugadores((prev) => prev.filter((j) => j.id !== id))
          toast({ title: "Éxito (modo desarrollo)", description: "Jugador eliminado exitosamente" })
        }
      }
    }
  }

  // Limpiar filtros
  const limpiarFiltros = () => {
    setBusqueda("")
    setFiltroEstado("active")
    setFiltroPosicion("all")
  }

  return (
    <div className={`min-h-screen ${safeTheme.bgColor} ${safeTheme.textColor} p-4`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <Link href="/staff">
          <Button variant="outline" className={`${safeTheme.borderColor} ${safeTheme.textColor} hover:bg-gray-100`}>
            Volver
          </Button>
        </Link>
        <div className="flex flex-col items-center">
          {safeTheme.logo ? (
            <img
              src={safeTheme.logo || "/placeholder.svg"}
              alt={safeTheme.clubName}
              className="w-16 h-16 object-contain mb-2 rounded-full"
            />
          ) : (
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-2">
              <span className="text-white text-xl font-bold">
                {safeTheme.clubName
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
            </div>
          )}
          <h1 className={`text-2xl font-bold text-center ${safeTheme.textColor}`}>Gestión de Jugadores</h1>
          {currentClient && <p className="text-sm text-gray-600 mt-1">Cliente: {currentClient.name}</p>}
        </div>
        <div className="w-20"></div>
      </div>

      <div className="max-w-6xl mx-auto">
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-white p-4 rounded-lg mb-4">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
            <p className="text-sm mt-2 text-gray-300">
              Nota: La aplicación está funcionando en modo simulado debido a problemas de permisos con Firebase.
            </p>
          </div>
        )}

        {/* Controles superiores: Crear jugador, Búsqueda y Filtros */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Botón crear jugador */}
          <Button
            className={`${safeTheme.primaryColor} text-white`}
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
          >
            ➕ {mostrarFormulario ? "Cancelar" : "Crear nuevo jugador"}
          </Button>

          {/* Búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar jugador por nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10 bg-white border border-gray-300 text-gray-900"
            />
          </div>

          {/* Filtros */}
          <div className="flex gap-2">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as "all" | "active" | "inactive")}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>

            <select
              value={filtroPosicion}
              onChange={(e) => setFiltroPosicion(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
            >
              <option value="all">Todas las posiciones</option>
              {posicionesGuardadas.map((pos, i) => (
                <option key={i} value={pos}>
                  {pos}
                </option>
              ))}
            </select>

            <Button variant="outline" onClick={limpiarFiltros} className="px-3">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Información de resultados */}
        <div className="mb-4 text-sm text-gray-600">
          Mostrando {jugadoresFiltrados.length} de {jugadores.length} jugadores
          {busqueda && ` • Búsqueda: "${busqueda}"`}
          {filtroEstado !== "all" && ` • Estado: ${filtroEstado === "active" ? "Activos" : "Inactivos"}`}
          {filtroPosicion !== "all" && ` • Posición: ${filtroPosicion}`}
        </div>

        {mostrarFormulario && (
          <div className={`${safeTheme.cardBg} border ${safeTheme.borderColor} rounded-xl p-6 mb-6`}>
            <h2 className={`text-lg font-semibold ${safeTheme.textColor} mb-6`}>Nuevo Jugador</h2>

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
                    className={`bg-white border ${safeTheme.borderColor} text-gray-900`}
                  />
                </div>

                <div>
                  <Label htmlFor="apellidos">Apellidos *</Label>
                  <Input
                    id="apellidos"
                    placeholder="Apellidos"
                    value={apellidos}
                    onChange={(e) => setApellidos(e.target.value)}
                    className={`bg-white border ${safeTheme.borderColor} text-gray-900`}
                  />
                </div>

                <div>
                  <Label htmlFor="nombreId">Nombre ID *</Label>
                  <Input
                    id="nombreId"
                    placeholder="Nombre ID"
                    value={nombreId}
                    onChange={(e) => setNombreId(e.target.value)}
                    className={`bg-white border ${safeTheme.borderColor} text-gray-900`}
                  />
                </div>

                <div>
                  <Label htmlFor="nroDocumento">Nro. Documento *</Label>
                  <Input
                    id="nroDocumento"
                    placeholder="Número de documento"
                    value={nroDocumento}
                    onChange={(e) => setNroDocumento(e.target.value)}
                    className={`bg-white border ${safeTheme.borderColor} text-gray-900`}
                  />
                </div>

                <div>
                  <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
                  <DatePicker
                    selected={fechaNacimiento}
                    onChange={(date) => setFechaNacimiento(date)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Seleccionar fecha"
                    className={`w-full p-2 border ${safeTheme.borderColor} rounded-md bg-white text-gray-900`}
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
                  <Label htmlFor="posicionPrincipal">Posición Principal *</Label>
                  <select
                    id="posicionPrincipal"
                    value={posicionPrincipal}
                    onChange={(e) => setPosicionPrincipal(e.target.value)}
                    className={`w-full p-2 border ${safeTheme.borderColor} rounded-md bg-white text-gray-900`}
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
                      className={`bg-white border ${safeTheme.borderColor} text-gray-900`}
                    />
                    <Button onClick={agregarNuevaPosicion} className={`${safeTheme.primaryColor} text-white`}>
                      Agregar
                    </Button>
                  </div>
                )}

                <div>
                  <Label htmlFor="perfilHabil">Perfil Hábil *</Label>
                  <select
                    id="perfilHabil"
                    value={perfilHabil}
                    onChange={(e) => setPerfilHabil(e.target.value as "izquierdo" | "derecho" | "")}
                    className={`w-full p-2 border ${safeTheme.borderColor} rounded-md bg-white text-gray-900`}
                  >
                    <option value="">Seleccionar perfil</option>
                    <option value="izquierdo">Izquierdo</option>
                    <option value="derecho">Derecho</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="altura">Altura (cm) *</Label>
                  <Input
                    id="altura"
                    type="number"
                    placeholder="Ej: 180"
                    value={altura}
                    onChange={(e) => setAltura(e.target.value)}
                    className={`bg-white border ${safeTheme.borderColor} rounded-md bg-white text-gray-900`}
                  />
                </div>

                <div>
                  <Label htmlFor="peso">Peso (kg) *</Label>
                  <Input
                    id="peso"
                    type="number"
                    step="0.1"
                    placeholder="Ej: 75.5"
                    value={peso}
                    onChange={(e) => setPeso(e.target.value)}
                    className={`bg-white border ${safeTheme.borderColor} rounded-md bg-white text-gray-900`}
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
                  <Label htmlFor="nombreUsuario">Nombre de Usuario *</Label>
                  <Input
                    id="nombreUsuario"
                    placeholder="Nombre de usuario"
                    value={nombreUsuario}
                    onChange={(e) => setNombreUsuario(e.target.value)}
                    className={`bg-white border ${safeTheme.borderColor} text-gray-900`}
                  />
                </div>

                <div>
                  <Label htmlFor="contrasena">Contraseña *</Label>
                  <Input
                    id="contrasena"
                    type="password"
                    placeholder="Contraseña"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    className={`bg-white border ${safeTheme.borderColor} text-gray-900`}
                  />
                </div>

                <div>
                  <Label htmlFor="estadoUsuario">Estado del Usuario *</Label>
                  <select
                    id="estadoUsuario"
                    value={estadoUsuario}
                    onChange={(e) => setEstadoUsuario(e.target.value as "active" | "inactive")}
                    className={`w-full p-2 border ${safeTheme.borderColor} rounded-md bg-white text-gray-900`}
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-blue-800 text-sm">
                    <strong>ℹ️ Información:</strong> Se creará automáticamente un usuario para que el jugador pueda
                    acceder a la aplicación con las credenciales proporcionadas.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex gap-4">
                <Button className={`${safeTheme.primaryColor} text-white`} onClick={guardarJugador}>
                  Guardar Jugador
                </Button>
                <Button variant="outline" onClick={resetFormulario}>
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}

        <h2 className="text-xl font-semibold text-gray-700 mb-4">Jugadores del Cliente</h2>

        {cargando ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando jugadores...</p>
          </div>
        ) : jugadoresFiltrados.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-500 text-2xl">👥</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {jugadores.length === 0 ? "No hay jugadores registrados" : "No se encontraron jugadores"}
            </h3>
            <p className="text-gray-500 mb-4">
              {jugadores.length === 0
                ? "Aún no hay jugadores en el sistema. Puedes crear y gestionar jugadores desde aquí."
                : "Intenta ajustar los filtros de búsqueda para encontrar jugadores."}
            </p>
            {jugadores.length === 0 ? (
              <Button className={`${safeTheme.primaryColor} text-white`} onClick={() => setMostrarFormulario(true)}>
                Crear primer jugador
              </Button>
            ) : (
              <Button variant="outline" onClick={limpiarFiltros}>
                Limpiar filtros
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {jugadoresFiltrados.map((jugador) => (
              <div
                key={jugador.id}
                className={`${safeTheme.cardBg} border ${safeTheme.borderColor} rounded-xl p-4 hover:shadow-lg transition-all duration-200 relative group`}
              >
                {/* Indicador de estado */}
                <div
                  className={`absolute top-2 left-2 w-3 h-3 rounded-full ${
                    jugador.estadoUsuario === "active" ? "bg-green-500" : "bg-red-500"
                  }`}
                  title={jugador.estadoUsuario === "active" ? "Activo" : "Inactivo"}
                ></div>

                {/* Botón de editar */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/staff/jugadores/${jugador.id}/edit`)
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                >
                  <Edit className="w-4 h-4 text-gray-600" />
                </button>

                {/* Contenido de la tarjeta - clickeable */}
                <div onClick={() => router.push(`/staff/jugadores/${jugador.id}`)} className="cursor-pointer">
                  {/* Header con foto y nombre */}
                  <div className="flex items-start gap-3 mb-3 mt-2">
                    {jugador.foto ? (
                      <img
                        src={jugador.foto || "/placeholder.svg"}
                        alt={`${jugador.nombre} ${jugador.apellidos}`}
                        className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {jugador.nombre?.[0] || ""}
                        {jugador.apellidos?.[0] || ""}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm leading-tight truncate">
                        {jugador.nombre} {jugador.apellidos}
                      </h3>
                    </div>
                  </div>

                  {/* Información adicional */}
                  <div className="space-y-1">
                    <p className="text-gray-600 text-sm">{jugador.posicionPrincipal || "Sin posición"}</p>
                    <p className="text-gray-500 text-xs">
                      {jugador.perfilHabil
                        ? `${jugador.perfilHabil.charAt(0).toUpperCase() + jugador.perfilHabil.slice(1)}`
                        : "Sin perfil"}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {jugador.fechaNacimiento ? `${calcularEdad(jugador.fechaNacimiento)} años` : "Edad no disponible"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Información sobre gestión compartida */}
        {currentClient && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Gestión Compartida</h3>
            <p className="text-blue-800 text-sm">
              Todos los miembros del equipo pueden crear, editar y visualizar estos jugadores. Los jugadores creados
              aquí estarán disponibles para todo el staff y tendrán acceso automático a la aplicación.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
