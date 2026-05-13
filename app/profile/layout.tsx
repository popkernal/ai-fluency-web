import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profile',
  description: 'Your AI fluency stats, achievements, learning streaks, and account settings.',
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
