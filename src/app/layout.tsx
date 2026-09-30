import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
  title: 'Cognilabs CRM — biznesingiz uchun yagona boshqaruv tizimi',
  description:
    "Savdo, ombor, mijozlar va hisobotlar — bitta zamonaviy CRM'da. POS, filiallar, rollar va real vaqt statistikasi.",
}

export const viewport: Viewport = {
  themeColor: '#02b856',
  width: 'device-width',
  initialScale: 1,
}

// Runs before first paint so the saved / system theme never flashes.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(!t){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.setAttribute('data-theme',t)}catch(e){}})()`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
