import type { Metadata } from 'next'
import { Cinzel, DM_Sans } from 'next/font/google'
import './globals.css'

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-cinzel',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Cosmere — Atlas Estelar',
  description: 'Atlas interactivo del universo Cosmere de Brandon Sanderson',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${cinzel.variable} ${dmSans.variable}`}>
      <body style={{ fontFamily: 'var(--font-dm-sans, "DM Sans", sans-serif)' }}>
        {children}
      </body>
    </html>
  )
}
