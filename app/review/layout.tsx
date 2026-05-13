import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Daily Review',
  description: 'Reinforce what you\'ve learned with daily spaced-repetition exercises.',
}

export default function ReviewLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
