import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Playground',
  description: 'Experiment with prompts in a free-form AI sandbox and get instant feedback.',
}

export default function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
