import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DuranGo AI',
  description: 'Sistema inteligente de consumo local — Durango, México',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
