export const clubThemes = {
  default: {
    bgColor: "bg-white",
    textColor: "text-gray-900",
    primaryColor: "bg-green-600 hover:bg-green-700",
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
export const getThemeForUser = (userId?: string, userRole?: string): ClubTheme => {
  // Aquí puedes implementar la lógica para determinar el tema según el usuario
  // Por ejemplo:

  // Si es un usuario específico de Peñarol
  if (userId?.includes("penarol") || userRole === "penarol_staff") {
    return "penarol"
  }

  // Si es un usuario específico de Nacional
  if (userId?.includes("nacional") || userRole === "nacional_staff") {
    return "nacional"
  }

  // Por defecto, tema genérico
  return "default"
}

// Función simple para obtener el tema actual (mantenemos compatibilidad)
export const getCurrentTheme = (): ClubTheme => {
  if (typeof localStorage !== "undefined") {
    const saved = localStorage.getItem("clubTheme") as ClubTheme
    if (saved && clubThemes[saved]) {
      return saved
    }
  }
  return "default" // Default to generic theme
}

// Función para establecer el tema según el usuario (nueva funcionalidad)
export const setThemeForUser = (userId: string, userRole?: string): ClubTheme => {
  const theme = getThemeForUser(userId, userRole)

  if (typeof localStorage !== "undefined") {
    localStorage.setItem("clubTheme", theme)
    localStorage.setItem("userId", userId)
    if (userRole) {
      localStorage.setItem("userRole", userRole)
    }
  }

  return theme
}

// Función para limpiar el tema al cerrar sesión
export const clearUserTheme = (): void => {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem("clubTheme")
    localStorage.removeItem("userId")
    localStorage.removeItem("userRole")
  }
}

// Simple function to set the current theme (mantenemos para compatibilidad)
export const setCurrentTheme = (theme: ClubTheme): void => {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("clubTheme", theme)
  }
}
