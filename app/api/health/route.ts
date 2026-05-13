import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

interface HealthCheck {
  status: 'ok' | 'degraded' | 'error'
  timestamp: string
  checks: {
    database: 'ok' | 'error'
    anthropicApiKey: 'ok' | 'missing'
  }
  version: string
}

export async function GET() {
  const checks: HealthCheck['checks'] = {
    database: 'error',
    anthropicApiKey: 'missing',
  }

  // Check database connectivity
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('users').select('id').limit(1)
    checks.database = error ? 'error' : 'ok'
  } catch {
    checks.database = 'error'
  }

  // Check Anthropic API key is configured
  checks.anthropicApiKey = process.env.ANTHROPIC_API_KEY ? 'ok' : 'missing'

  const allOk = checks.database === 'ok' && checks.anthropicApiKey === 'ok'
  const status: HealthCheck['status'] = allOk ? 'ok' : 'degraded'

  const body: HealthCheck = {
    status,
    timestamp: new Date().toISOString(),
    checks,
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? 'dev',
  }

  return NextResponse.json(body, {
    status: allOk ? 200 : 503,
  })
}
