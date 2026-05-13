import { notFound } from 'next/navigation'
import { getOrgDashboard } from '@/lib/adminEngine'
import { OrgDashboardClient } from './OrgDashboardClient'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ orgId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orgId } = await params
  const data = await getOrgDashboard(orgId)
  if (!data) return { title: 'Org Not Found — Admin' }
  return { title: `${data.org.name ?? orgId} — Admin` }
}

export default async function OrgDashboardPage({ params }: Props) {
  const { orgId } = await params
  const data = await getOrgDashboard(orgId)
  if (!data) notFound()

  return <OrgDashboardClient data={data} />
}
