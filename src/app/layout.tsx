import type { Metadata } from 'next'
import './globals.css'
import { NavHeader } from '@/components/ui/NavHeader'

export const metadata: Metadata = {
  title: 'DuranGo AI',
  description: 'Sistema inteligente de consumo local — Durango, México',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <NavHeader />
        {children}
      </body>
    </html>
  )
}
