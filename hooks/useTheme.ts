import { clubThemes, getCurrentTheme, type ClubTheme } from "@/lib/themes"

export const useTheme = (theme?: ClubTheme) => {
  const currentTheme = theme || getCurrentTheme()
  return clubThemes[currentTheme]
}
