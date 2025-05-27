export interface StaffModule {
  id: string
  name: string
  description: string
  icon: string
  route: string
}

export const STAFF_MODULES: StaffModule[] = [
  {
    id: "jugadores",
    name: "Gestión de Jugadores",
    description: "Gestión de jugadores del equipo",
    icon: "👤",
    route: "/staff/jugadores",
  },
  {
    id: "calendario",
    name: "Calendario",
    description: "Planificación semanal de actividades",
    icon: "📅",
    route: "/staff/calendario",
  },
  {
    id: "evaluaciones",
    name: "Evaluaciones",
    description: "Evaluaciones y tests de rendimiento",
    icon: "🧪",
    route: "/staff/evaluaciones",
  },
  {
    id: "ingreso_jugadores",
    name: "Ingreso Jugadores",
    description: "Acceso a formularios para jugadores",
    icon: "🧍",
    route: "/players",
  },
  {
    id: "carga_externa",
    name: "Carga Externa",
    description: "Monitoreo de carga externa de entrenamiento",
    icon: "📊",
    route: "/staff/carga-externa",
  },
  {
    id: "carga_interna",
    name: "Carga Interna",
    description: "Análisis de wellness y RPE",
    icon: "💬",
    route: "/staff/carga-interna",
  },
  {
    id: "entrenamientos",
    name: "Gestión de Entrenamientos",
    description: "Planificación y gestión de entrenamientos",
    icon: "🏋️",
    route: "/staff/entrenamientos",
  },
  {
    id: "partidos",
    name: "Gestión de Partidos",
    description: "Organización y seguimiento de partidos",
    icon: "🏟️",
    route: "/staff/partidos",
  },
]

export const getDefaultEnabledModules = (): string[] => {
  return ["jugadores", "calendario", "ingreso_jugadores", "carga_interna"] // Agregar ingreso_jugadores a los módulos por defecto
}

export const getModuleById = (id: string): StaffModule | undefined => {
  return STAFF_MODULES.find((module) => module.id === id)
}

export const getEnabledModules = (enabledModuleIds: string[]): StaffModule[] => {
  return STAFF_MODULES.filter((module) => enabledModuleIds.includes(module.id))
}
