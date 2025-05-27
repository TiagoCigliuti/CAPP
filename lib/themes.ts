import type { User, Client } from "./users"
import { obtenerTemas, agregarTema, actualizarTema, eliminarTema, obtenerTema } from "./firestoreHelpers"

export const clubThemes = {
  default: {
    bgColor: "bg-white",
    textColor: "text-gray-900",
    primaryColor: "bg-blue-600 hover:bg-blue-700",
    secondaryColor: "bg-gray-800 hover:bg-gray-700",
    accentColor: "bg-gray-600 hover:bg-gray-500",
    borderColor: "border-gray-300",
    cardBg: "bg-gray-50",
    logo: null,
    clubName: "Sistema Deportivo",
  },
  penarol: {
    bgColor: "bg-black",
    textColor: "text-yellow-400",
    primaryColor: "bg-yellow-500 hover:bg-yellow-600",
    secondaryColor: "bg-gray-800 hover:bg-gray-700",
    accentColor: "bg-yellow-600 hover:bg-yellow-500",
    borderColor: "border-yellow-400",
    cardBg: "bg-gray-900",
    logo: "/penarol-white-bg.png",
    clubName: "Club Atlético Peñarol",
  },
  nacional: {
    bgColor: "bg-white",
    textColor: "text-blue-800",
    primaryColor: "bg-red-500 hover:bg-red-600",
    secondaryColor: "bg-gray-800 hover:bg-gray-700",
    accentColor: "bg-blue-600 hover:bg-blue-500",
    borderColor: "border-blue-300",
    cardBg: "bg-blue-50",
    logo: "/logos/nacional.png",
    clubName: "Club Nacional de Football",
  },
}

export type ClubTheme = keyof typeof clubThemes

export interface CustomTheme {
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

// === FUNCIONES PARA TEMAS PERSONALIZADOS ===
export const getCustomThemes = async (): Promise<CustomTheme[]> => {
  try {
    return await obtenerTemas()
  } catch (error) {
    console.error("Error getting custom themes:", error)
    // Fallback a localStorage si Firebase falla
    if (typeof localStorage !== "undefined") {
      const stored = localStorage.getItem("customThemes")
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch (parseError) {
          console.error("Error parsing custom themes from localStorage:", parseError)
        }
      }
    }
    return []
  }
}

export const createCustomTheme = async (name: string, colors: CustomTheme["colors"]): Promise<CustomTheme> => {
  try {
    const themeData = {
      name,
      colors,
    }

    return await agregarTema(themeData)
  } catch (error) {
    console.error("Error creating custom theme:", error)
    throw error
  }
}

export const updateCustomTheme = async (
  themeId: string,
  updates: Partial<Pick<CustomTheme, "name" | "colors">>,
): Promise<CustomTheme | null> => {
  try {
    return await actualizarTema(themeId, updates)
  } catch (error) {
    console.error("Error updating custom theme:", error)
    throw error
  }
}

export const deleteCustomTheme = async (themeId: string): Promise<void> => {
  try {
    await eliminarTema(themeId)
  } catch (error) {
    console.error("Error deleting custom theme:", error)
    throw error
  }
}

export const getCustomThemeById = async (themeId: string): Promise<CustomTheme | null> => {
  try {
    return await obtenerTema(themeId)
  } catch (error) {
    console.error("Error getting custom theme by id:", error)
    return null
  }
}

// === FUNCIONES DE APLICACIÓN DE TEMAS ===

// Función para aplicar estilos CSS dinámicamente
export const applyDynamicStyles = (theme: any) => {
  if (typeof document === "undefined") return

  // Remover estilos anteriores si existen
  const existingStyle = document.getElementById("dynamic-theme-styles")
  if (existingStyle) {
    existingStyle.remove()
  }

  // Crear nuevos estilos
  const style = document.createElement("style")
  style.id = "dynamic-theme-styles"

  // Extraer colores del tema
  const colors = extractColorsFromTheme(theme)

  style.textContent = `
    :root {
      --theme-primary: ${colors.primary};
      --theme-secondary: ${colors.secondary};
      --theme-background: ${colors.background};
      --theme-text: ${colors.text};
      --theme-accent: ${colors.accent};
      --theme-border: ${colors.border};
    }
    
    .theme-bg { background-color: var(--theme-background) !important; }
    .theme-text { color: var(--theme-text) !important; }
    .theme-primary { background-color: var(--theme-primary) !important; }
    .theme-secondary { background-color: var(--theme-secondary) !important; }
    .theme-accent { background-color: var(--theme-accent) !important; }
    .theme-border { border-color: var(--theme-border) !important; }
    
    .theme-primary-hover:hover { background-color: var(--theme-primary) !important; opacity: 0.9; }
    .theme-secondary-hover:hover { background-color: var(--theme-secondary) !important; opacity: 0.9; }
  `

  document.head.appendChild(style)
}

// Función para extraer colores del tema
const extractColorsFromTheme = (theme: any) => {
  // Si es un tema personalizado con estructura de colores
  if (theme.colors) {
    return theme.colors
  }

  // Si es un tema predefinido, extraer colores de las clases CSS
  return {
    primary: extractColorFromClass(theme.primaryColor) || "#3B82F6",
    secondary: extractColorFromClass(theme.secondaryColor) || "#1F2937",
    background: extractColorFromClass(theme.bgColor) || "#FFFFFF",
    text: extractColorFromClass(theme.textColor) || "#111827",
    accent: extractColorFromClass(theme.accentColor) || "#6B7280",
    border: extractColorFromClass(theme.borderColor) || "#D1D5DB",
  }
}

// Función auxiliar para extraer color de clase CSS
const extractColorFromClass = (cssClass: string): string | null => {
  if (!cssClass) return null

  // Mapeo básico de clases Tailwind a colores hex
  const colorMap: { [key: string]: string } = {
    "bg-blue-600": "#2563EB",
    "bg-yellow-500": "#EAB308",
    "bg-red-500": "#EF4444",
    "bg-gray-800": "#1F2937",
    "bg-gray-600": "#4B5563",
    "bg-white": "#FFFFFF",
    "bg-black": "#000000",
    "text-gray-900": "#111827",
    "text-yellow-400": "#FACC15",
    "text-blue-800": "#1E40AF",
    "border-gray-300": "#D1D5DB",
    "border-yellow-400": "#FACC15",
    "border-blue-300": "#93C5FD",
  }

  // Buscar coincidencia en el mapeo
  for (const [className, color] of Object.entries(colorMap)) {
    if (cssClass.includes(className)) {
      return color
    }
  }

  return null
}

// Función para aplicar tema de cliente automáticamente
export const setThemeForClient = async (client: Client): Promise<void> => {
  try {
    let themeToApply: any = null

    console.log("🎨 Applying theme for client:", client.name, "Theme ID:", client.theme)

    // Si el cliente tiene un tema personalizado
    if (client.theme && !clubThemes[client.theme as ClubTheme]) {
      const customTheme = await getCustomThemeById(client.theme)
      if (customTheme) {
        themeToApply = convertCustomThemeToClubTheme(customTheme)
        // Agregar información del cliente
        themeToApply.clubName = client.clubName || client.name
        themeToApply.logo = client.logo || null
        console.log("✅ Applied custom theme:", customTheme.name, "Colors:", customTheme.colors)
      }
    } else if (client.theme && clubThemes[client.theme as ClubTheme]) {
      // Si es un tema predefinido
      themeToApply = { ...clubThemes[client.theme as ClubTheme] }
      themeToApply.clubName = client.clubName || client.name
      themeToApply.logo = client.logo || themeToApply.logo
      console.log("✅ Applied predefined theme:", client.theme)
    }

    if (themeToApply) {
      // Guardar tema en localStorage para uso inmediato
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("currentClientTheme", JSON.stringify(themeToApply))
        localStorage.setItem("clubTheme", client.theme)
        console.log("💾 Theme saved to localStorage:", themeToApply)
      }

      // Aplicar estilos CSS dinámicamente
      applyDynamicStyles(themeToApply)
    } else {
      console.log("⚠️ No theme to apply, using default")
      // Si no hay tema, aplicar el default
      const defaultTheme = {
        ...clubThemes.default,
        clubName: client.clubName || client.name,
        logo: client.logo || null,
      }

      if (typeof localStorage !== "undefined") {
        localStorage.setItem("currentClientTheme", JSON.stringify(defaultTheme))
        localStorage.setItem("clubTheme", "default")
      }

      applyDynamicStyles(defaultTheme)
    }
  } catch (error) {
    console.error("❌ Error setting theme for client:", error)
  }
}

// === FUNCIONES EXISTENTES ACTUALIZADAS ===

// Función para obtener el tema actual (incluyendo temas de cliente)
export const getCurrentTheme = (): any => {
  if (typeof localStorage !== "undefined") {
    // Primero intentar obtener tema del cliente actual
    const clientTheme = localStorage.getItem("currentClientTheme")
    if (clientTheme) {
      try {
        const theme = JSON.parse(clientTheme)
        console.log("🎨 Using client theme:", theme.clubName || "Unknown", theme.colors || "No colors")
        return theme
      } catch (error) {
        console.error("Error parsing client theme:", error)
      }
    }

    // Fallback a tema predefinido
    const saved = localStorage.getItem("clubTheme") as ClubTheme
    if (saved && clubThemes[saved]) {
      console.log("🎨 Using predefined theme:", saved)
      return clubThemes[saved]
    }
  }
  console.log("🎨 Using default theme")
  return clubThemes.default
}

// Función para obtener el tema basado en el usuario
export const getThemeForUser = (user: User): ClubTheme => {
  // Si el usuario tiene un tema específico asignado
  if (user.theme && clubThemes[user.theme as ClubTheme]) {
    return user.theme as ClubTheme
  }

  // Lógica basada en el username o role
  if (user.username.toLowerCase().includes("penarol")) {
    return "penarol"
  }

  if (user.username.toLowerCase().includes("nacional")) {
    return "nacional"
  }

  // Por defecto, tema genérico
  return "default"
}

// Función para establecer el tema según el usuario - siempre default por defecto
export const setThemeForUser = (user: User): ClubTheme => {
  // Por ahora, siempre usar tema default
  const theme = "default"

  if (typeof localStorage !== "undefined") {
    localStorage.setItem("clubTheme", theme)
  }

  return theme
}

// Función para limpiar el tema al cerrar sesión
export const clearUserTheme = (): void => {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem("clubTheme")
    localStorage.removeItem("currentClientTheme")
  }

  // Remover estilos dinámicos
  if (typeof document !== "undefined") {
    const existingStyle = document.getElementById("dynamic-theme-styles")
    if (existingStyle) {
      existingStyle.remove()
    }
  }
}

// Función para establecer tema manualmente (para admins)
export const setCurrentTheme = (theme: ClubTheme): void => {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("clubTheme", theme)
  }
}

// Función para convertir tema personalizado a formato de clubThemes
export const convertCustomThemeToClubTheme = (customTheme: CustomTheme) => {
  return {
    bgColor: `bg-[${customTheme.colors.background}]`,
    textColor: `text-[${customTheme.colors.text}]`,
    primaryColor: `bg-[${customTheme.colors.primary}] hover:bg-[${customTheme.colors.primary}]/90`,
    secondaryColor: `bg-[${customTheme.colors.secondary}] hover:bg-[${customTheme.colors.secondary}]/90`,
    accentColor: `bg-[${customTheme.colors.accent}] hover:bg-[${customTheme.colors.accent}]/90`,
    borderColor: `border-[${customTheme.colors.border}]`,
    cardBg: `bg-[${customTheme.colors.background}]/50`,
    logo: null,
    clubName: customTheme.name,
    colors: customTheme.colors, // Mantener colores originales
  }
}

// Función para inicializar tema al cargar la aplicación
export const initializeTheme = async (): Promise<void> => {
  if (typeof localStorage !== "undefined") {
    const clientTheme = localStorage.getItem("currentClientTheme")
    if (clientTheme) {
      try {
        const theme = JSON.parse(clientTheme)
        console.log("🚀 Initializing theme on page load:", theme.clubName || "Unknown")
        applyDynamicStyles(theme)
      } catch (error) {
        console.error("Error initializing theme:", error)
      }
    }
  }
}
