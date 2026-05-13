import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { ColorModeScript } from '@chakra-ui/react'
import { PostHogProvider } from '@/components/layout/PostHogProvider'
import { Providers } from './providers'
import { TopBar } from '@/components/layout/TopBar'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

// ─── Fonts ────────────────────────────────────────────────────────────────────

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    template: '%s | AI Fluency',
    default: 'AI Fluency — Learn to work with AI effectively',
  },
  description:
    'A professional development platform that teaches AI fluency through daily bite-sized lessons, hands-on exercises, and a prompt playground.',
  metadataBase: new URL('https://aifluency.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://aifluency.app',
    siteName: 'AI Fluency',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <ColorModeScript initialColorMode="light" />
      </head>
      <body>
        <PostHogProvider>
          <Providers>
            {/* Top bar: always visible */}
            <TopBar />

            {/* Sidebar: desktop only (lg+) */}
            <Sidebar />

            {/* Main content area */}
            <main
              style={{
                paddingTop: '56px',
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                minHeight: '100vh',
              }}
              className="main-content"
            >
              {/* Content max-width wrapper */}
              <div className="content-wrapper">
                {children}
              </div>
            </main>

            {/* Mobile nav: <768px */}
            <MobileNav />
          </Providers>
          <Analytics />
        </PostHogProvider>
      </body>
    </html>
  )
}
