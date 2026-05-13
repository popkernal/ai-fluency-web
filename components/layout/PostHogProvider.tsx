'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect, ReactNode } from 'react'

export function PostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com'

    if (!key) return

    posthog.init(key, {
      api_host: host,
      capture_pageview: false,   // handled manually in usePageView
      capture_pageleave: true,
      session_recording: {
        maskAllInputs: false,
        maskInputOptions: { password: true },
      },
      loaded: (ph) => {
        // Opt out in dev to avoid polluting data
        if (process.env.NODE_ENV === 'development') {
          ph.opt_out_capturing()
        }
      },
    })
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
