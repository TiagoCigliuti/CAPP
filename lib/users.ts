import {
  obtenerClientes,
  obtenerUsuarios,
  obtenerUsuarioPorCredenciales,
  agregarCliente,
  agregarUsuario,
  actualizarCliente,
  actualizarUsuario,
  desactivarUsuariosDeCliente,
  inicializarDatosIniciales,
} from "./firestoreHelpers"
import { getDefaultEnabledModules } from "./staffModules"
import { setThemeForClient, clearUserTheme } from "./themes"

export interface Client {
  id: string
  name: string
  clubName?: string
  theme: string
  logo?: string
  status: "active" | "inactive"
  enabledModules?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  username: string
  password: string
  role: "admin" | "client_user" | "jugador"
  clientId?: string
  status: "active" | "inactive"
  createdAt: Date
  updatedAt: Date
}

// === FUNCIONES PARA CLIENTES ===
export const getClients = async (): Promise<Client[]> => {
  try {
    return await obtenerClientes()
  } catch (error) {
    console.error("Error getting clients:", error)
    // Fallback a datos locales en caso de error
    return getClientsFromLocalStorage()
  }
}

// Update the createClient function to handle optional logo parameter and enabled modules
export const createClient = async (
  name: string,
  clubName = "",
  theme = "default",
  logo?: string,
  enabledModules?: string[],
): Promise<Client> => {
  try {
    const clientData: any = {
      name,
      clubName: clubName || name,
      theme,
      status: "active" as const,
      enabledModules: enabledModules || getDefaultEnabledModules(),
    }

    // Only add logo if it's provided and not undefined
    if (logo && logo.trim()) {
      clientData.logo = logo
    }

    return await agregarCliente(clientData)
  } catch (error) {
    console.error("Error creating client:", error)
    throw error
  }
}

export const updateClient = async (clientId: string, updates: Partial<Client>): Promise<Client | null> => {
  try {
    const updatedClient = await actualizarCliente(clientId, updates)

    // Si el cliente se desactiva, desactivar todos sus usuarios
    if (updates.status === "inactive") {
      await desactivarUsuariosDeCliente(clientId)
    }

    return updatedClient
  } catch (error) {
    console.error("Error updating client:", error)
    throw error
  }
}

export const getClientById = async (id: string): Promise<Client | null> => {
  try {
    const clients = await getClients()
    return clients.find((c) => c.id === id) || null
  } catch (error) {
    console.error("Error getting client by id:", error)
    return null
  }
}

// === FUNCIONES PARA USUARIOS ===
export const getUsers = async (): Promise<User[]> => {
  try {
    return await obtenerUsuarios()
  } catch (error) {
    console.error("Error getting users:", error)
    // Fallback a datos locales en caso de error
    return getUsersFromLocalStorage()
  }
}

// Update the createUser function to handle different roles
export const createUser = async (
  username: string,
  password: string,
  clientId: string,
  role: "client_user" | "jugador" = "client_user",
): Promise<User> => {
  try {
    const userData = {
      username: username.trim(),
      password: password.trim(),
      role,
      clientId: clientId.trim(),
      status: "active" as const,
    }

    return await agregarUsuario(userData)
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

export const updateUser = async (userId: string, updates: Partial<User>): Promise<User | null> => {
  try {
    return await actualizarUsuario(userId, updates)
  } catch (error) {
    console.error("Error updating user:", error)
    throw error
  }
}

// === AUTENTICACIÓN ===
export const authenticateUser = async (username: string, password: string): Promise<User | null> => {
  try {
    const user = await obtenerUsuarioPorCredenciales(username, password)

    if (!user) return null

    // Verificar que el usuario esté activo
    if (user.status === "inactive") return null

    // Si es usuario de cliente, verificar que el cliente esté activo y aplicar tema
    if (user.role === "client_user" || user.role === "jugador") {
      if (user.clientId) {
        const client = await getClientById(user.clientId)
        if (!client || client.status === "inactive") return null

        // Aplicar el tema del cliente automáticamente
        await setThemeForClient(client)
      }
    } else {
      // Para admins, usar tema default
      clearUserTheme()
    }

    return user as User
  } catch (error) {
    console.error("Error authenticating user:", error)
    return null
  }
}

// === FUNCIONES DE UTILIDAD ===
export const isAdmin = (user: User): boolean => {
  return user.role === "admin"
}

export const isClientUser = (user: User): boolean => {
  return user.role === "client_user"
}

export const getCurrentUser = (): User | null => {
  if (typeof localStorage !== "undefined") {
    const userData = localStorage.getItem("currentUser")
    if (userData) {
      try {
        return JSON.parse(userData)
      } catch (error) {
        console.error("Error parsing user data:", error)
        return null
      }
    }
  }
  return null
}

export const setCurrentUser = (user: User): void => {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("currentUser", JSON.stringify(user))
  }
}

export const clearCurrentUser = (): void => {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem("currentUser")
    // También limpiar el tema al cerrar sesión
    clearUserTheme()
  }
}

export const getCurrentClient = async (): Promise<Client | null> => {
  const user = getCurrentUser()
  if (user && user.clientId) {
    return await getClientById(user.clientId)
  }
  return null
}

// === FUNCIÓN PARA OBTENER TEMA ACTUAL ===
export const getCurrentTheme = async (): Promise<any> => {
  try {
    const user = getCurrentUser()
    if (user && user.clientId) {
      const client = await getClientById(user.clientId)
      if (client) {
        // Si el tema es un string, intentar parsearlo como JSON
        if (typeof client.theme === "string") {
          try {
            return JSON.parse(client.theme)
          } catch {
            // Si no es JSON válido, retornar como string
            return { name: client.theme }
          }
        }
        return client.theme
      }
    }
    // Tema por defecto
    return { name: "default" }
  } catch (error) {
    console.error("Error getting current theme:", error)
    return { name: "default" }
  }
}

// === INICIALIZACIÓN ===
export const initializeApp = async (): Promise<void> => {
  try {
    await inicializarDatosIniciales()
  } catch (error) {
    console.error("Error initializing app:", error)
  }
}

// === FUNCIONES DE ROLES ADICIONALES ===
export const isJugador = (user: User): boolean => {
  return user.role === "jugador" || user.username.toLowerCase().includes("jugador")
}

export const getRouteForRole = (role: string): string => {
  switch (role) {
    case "admin":
      return "/admin"
    case "client_user":
      return "/staff" // Cambiar de "/client-dashboard" a "/staff"
    case "jugador":
      return "/jugador"
    default:
      return "/staff" // Cambiar default también
  }
}

// === FUNCIONES DE FALLBACK (localStorage) ===
const getClientsFromLocalStorage = (): Client[] => {
  if (typeof localStorage !== "undefined") {
    const stored = localStorage.getItem("clients")
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (error) {
        console.error("Error parsing clients from localStorage:", error)
      }
    }
  }
  return []
}

const getUsersFromLocalStorage = (): User[] => {
  if (typeof localStorage !== "undefined") {
    const stored = localStorage.getItem("users")
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (error) {
        console.error("Error parsing users from localStorage:", error)
      }
    }
  }
  return []
}
