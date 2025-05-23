"use client"

import type { ReactNode } from "react"
import { useTheme } from "@/hooks/useTheme"
import type { ClubTheme } from "@/lib/themes"
import Image from "next/image"

interface ThemedLayoutProps {
  children: ReactNode
  theme?: ClubTheme
  className?: string
}

export function ThemedLayout({ children, theme, className = "" }: ThemedLayoutProps) {
  const themeConfig = useTheme(theme)

  return <div className={`min-h-screen ${themeConfig.bgColor} ${themeConfig.textColor} ${className}`}>{children}</div>
}

interface ThemedHeaderProps {
  title: string
  backHref?: string
  theme?: ClubTheme
  onBack?: () => void
  rightContent?: ReactNode
}

export function ThemedHeader({ title, backHref, theme, onBack, rightContent }: ThemedHeaderProps) {
  const themeConfig = useTheme(theme)

  return (
    <div className="flex justify-between items-center mb-6">
      {backHref || onBack ? (
        <button
          onClick={onBack}
          className={`border border-gray-700 ${themeConfig.textColor} hover:bg-gray-800 hover:text-white px-4 py-2 rounded`}
        >
          Volver
        </button>
      ) : (
        <div className="w-20" />
      )}

      <div className="flex flex-col items-center">
        {themeConfig.logo && (
          <div className="relative w-[50px] h-[60px] mb-2">
            <Image src={themeConfig.logo || "/placeholder.svg"} alt="Club Logo" fill className="object-contain" />
          </div>
        )}
        <h1 className={`text-2xl font-bold text-center ${themeConfig.textColor}`}>{title}</h1>
      </div>

      {rightContent || <div className="w-20" />}
    </div>
  )
}

interface ThemedButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "outline"
  disabled?: boolean
  className?: string
  theme?: ClubTheme
  type?: "button" | "submit"
}

export function ThemedButton({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  className = "",
  theme,
  type = "button",
}: ThemedButtonProps) {
  const themeConfig = useTheme(theme)

  const getVariantClasses = () => {
    switch (variant) {
      case "primary":
        return `${themeConfig.primaryColor} text-black`
      case "secondary":
        return "bg-gray-800 text-white hover:bg-gray-700"
      case "outline":
        return `border border-gray-700 ${themeConfig.textColor} hover:bg-gray-800 hover:text-white`
      default:
        return `${themeConfig.primaryColor} text-black`
    }
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded font-medium transition ${getVariantClasses()} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      {children}
    </button>
  )
}
