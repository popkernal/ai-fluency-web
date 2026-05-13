'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'sans-serif', background: '#0F0F0F', color: '#F5F5F5' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ textAlign: 'center', maxWidth: 360 }}>
            <div style={{ fontSize: 48, fontWeight: 700, color: '#4B5563', marginBottom: 16 }}>500</div>
            <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Something went wrong</h1>
            <p style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 24 }}>
              An unexpected error occurred. Our team has been notified.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <a
                href="/"
                style={{ display: 'inline-flex', alignItems: 'center', height: 40, padding: '0 16px', borderRadius: 10, border: '1px solid #2D2D2D', background: '#1A1A1A', color: '#F5F5F5', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
              >
                Go home
              </a>
              <button
                onClick={reset}
                style={{ display: 'inline-flex', alignItems: 'center', height: 40, padding: '0 16px', borderRadius: 10, border: 'none', background: '#E8601C', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
