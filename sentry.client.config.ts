import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Replay captures 10% of all sessions and 100% of sessions with errors
  integrations: [
    Sentry.replayIntegration(),
  ],

  // Adjust sample rates for production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Only send in production
  enabled: process.env.NODE_ENV === 'production',

  // Don't send noise
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    'Non-Error promise rejection',
    /Loading chunk \d+ failed/,
    /Loading CSS chunk \d+ failed/,
  ],
})
