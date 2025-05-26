import type { User } from "./users"

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

// Función simple para obtener el tema actual - siempre default por defecto
export const getCurrentTheme = (): ClubTheme => {
  if (typeof localStorage !== "undefined") {
    const saved = localStorage.getItem("clubTheme") as ClubTheme
    if (saved && clubThemes[saved]) {
      return saved
    }
  }
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
  }
}

// Función para establecer tema manualmente (para admins)
export const setCurrentTheme = (theme: ClubTheme): void => {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("clubTheme", theme)
  }
}
