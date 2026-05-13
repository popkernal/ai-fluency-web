import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'AI Fluency — Learn to work with AI effectively'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#0F0F0F',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          padding: '60px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            width: 64,
            height: 64,
            background: '#F97316',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 32,
            fontWeight: 700,
            marginBottom: 32,
          }}
        >
          A
        </div>

        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: '#FFFFFF',
            lineHeight: 1.1,
            marginBottom: 20,
          }}
        >
          AI Fluency
        </div>

        <div
          style={{
            fontSize: 28,
            color: '#A3A3A3',
            maxWidth: 700,
            lineHeight: 1.4,
          }}
        >
          Learn to work with AI effectively through daily bite-sized lessons and hands-on exercises.
        </div>
      </div>
    ),
    { ...size }
  )
}
