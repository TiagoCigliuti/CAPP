import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
// Comentamos el ThemeSwitcher para ocultarlo
// import ThemeSwitcher from "@/components/theme-switcher"

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        {/* Theme switcher oculto - se activará según el usuario */}
        {/* <ThemeSwitcher /> */}
      </body>
    </html>
  )
}
