import { getCurrentTheme } from "./users"
import { applyDynamicStyles } from "./themes"

export async function setThemeForClient(clientId: string) {
  try {
    console.log("🎨 Setting theme for client:", clientId)

    // Obtener el tema del cliente
    const theme = await getCurrentTheme()

    if (theme) {
      console.log("🎨 Theme found:", theme)

      // Guardar en localStorage
      localStorage.setItem("currentTheme", JSON.stringify(theme))

      // Aplicar estilos dinámicos si es necesario
      if (typeof theme === "string") {
        applyDynamicStyles(theme)
      }

      console.log("✅ Theme applied successfully")
      return theme
    } else {
      console.log("⚠️ No theme found for client")
      return null
    }
  } catch (error) {
    console.error("❌ Error setting theme for client:", error)
    return null
  }
}

export function getThemeColors(theme: any) {
  if (!theme) {
    return {
      backgroundColor: "#2563EB",
      color: "#FFFFFF",
    }
  }

  // Si el tema tiene colores personalizados
  if (theme.colors) {
    return {
      backgroundColor: theme.colors.primary || "#2563EB",
      color: theme.colors.text || "#FFFFFF",
    }
  }

  // Mapeo de temas predefinidos a colores hex
  const themeColorMap: { [key: string]: { backgroundColor: string; color: string } } = {
    "bg-yellow-400": { backgroundColor: "#FACC15", color: "#000000" }, // Peñarol
    "bg-red-600": { backgroundColor: "#DC2626", color: "#FFFFFF" }, // Nacional
    "bg-blue-600": { backgroundColor: "#2563EB", color: "#FFFFFF" }, // Default
    "bg-green-600": { backgroundColor: "#16A34A", color: "#FFFFFF" },
    "bg-purple-600": { backgroundColor: "#9333EA", color: "#FFFFFF" },
    "bg-orange-600": { backgroundColor: "#EA580C", color: "#FFFFFF" },
  }

  // Si el tema es un string (clase CSS)
  if (typeof theme === "string") {
    return themeColorMap[theme] || { backgroundColor: "#2563EB", color: "#FFFFFF" }
  }

  // Si el tema tiene primaryColor
  if (theme.primaryColor) {
    return themeColorMap[theme.primaryColor] || { backgroundColor: "#2563EB", color: "#FFFFFF" }
  }

  // Fallback
  return { backgroundColor: "#2563EB", color: "#FFFFFF" }
}
