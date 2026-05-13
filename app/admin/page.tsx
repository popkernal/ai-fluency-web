import { Suspense } from 'react'
import { Box, SimpleGrid, Text } from '@chakra-ui/react'
import { getAdminKPIs, getEngagementChart } from '@/lib/adminEngine'
import { AdminOverviewClient } from './AdminOverviewClient'
import { SkeletonCard } from '@/components/ui/Skeleton'

export const metadata = { title: 'Admin — Overview' }
export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const [kpis, chart] = await Promise.all([getAdminKPIs(), getEngagementChart()])

  return (
    <Box display="flex" flexDirection="column" gap={6} maxW="6xl">
      <Text fontSize="22px" fontWeight="bold" color="text.primary">Overview</Text>

      {/* KPI cards */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={3}>
        <KPICard label="Total users"        value={kpis.totalUsers.toLocaleString()} />
        <KPICard label="Active today (DAU)" value={kpis.dau.toLocaleString()} />
        <KPICard label="Lessons today"      value={kpis.lessonsCompletedToday.toLocaleString()} />
        <KPICard label="Avg completion"     value={`${kpis.avgCompletionRate}%`} />
        <KPICard label="Review engagement"  value={`${kpis.reviewEngagement}%`} />
        <KPICard label="MRR"                value={`$${(kpis.mrr / 100).toLocaleString()}`} />
        <KPICard label="Active subscribers" value={kpis.activeSubscribers.toLocaleString()} />
        <KPICard label="Free → paid"        value={`${kpis.freeToPaidRate}%`} />
      </SimpleGrid>

      {/* Engagement chart (client component — recharts) */}
      <Suspense fallback={<SkeletonCard />}>
        <AdminOverviewClient chart={chart} />
      </Suspense>

      {/* PostHog funnel + session replay */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
        <Box
          borderRadius="xl" border="1px solid" borderColor="border.default"
          bg="surface" p={4} display="flex" flexDirection="column" gap={3}
        >
          <Box>
            <Text fontSize="sm" fontWeight="semibold" color="text.primary">Conversion funnel</Text>
            <Text fontSize="xs" color="text.secondary" mt="2px">
              Signup → First lesson → Lesson 5 → Track complete → Paywall → Upgrade
            </Text>
          </Box>
          <PostHogFunnelEmbed />
        </Box>

        <Box
          borderRadius="xl" border="1px solid" borderColor="border.default"
          bg="surface" p={4} display="flex" flexDirection="column" gap={3}
        >
          <Box>
            <Text fontSize="sm" fontWeight="semibold" color="text.primary">Session replays</Text>
            <Text fontSize="xs" color="text.secondary" mt="2px">
              PostHog recordings filtered to lesson pages
            </Text>
          </Box>
          <SessionReplayLink />
        </Box>
      </SimpleGrid>
    </Box>
  )
}

function KPICard({ label, value }: { label: string; value: string }) {
  return (
    <Box borderRadius="xl" border="1px solid" borderColor="border.default" bg="surface" p={4}>
      <Text fontSize="xs" color="text.secondary">{label}</Text>
      <Text fontSize="2xl" fontWeight="bold" color="text.primary" sx={{ fontVariantNumeric: "tabular-nums" }} mt={1}>{value}</Text>
    </Box>
  )
}

function PostHogFunnelEmbed() {
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com'
  const projectId = process.env.POSTHOG_PROJECT_ID

  if (!projectId) {
    return (
      <Box borderRadius="lg" border="1px dashed" borderColor="border.default" p={4} textAlign="center">
        <Text fontSize="xs" color="text.secondary">
          Set <Box as="code" fontFamily="mono" fontSize="11px">POSTHOG_PROJECT_ID</Box> to embed funnel insights.
        </Text>
        <Box
          as="a"
          href={`${posthogHost}/insights`}
          target="_blank"
          rel="noopener noreferrer"
          display="inline-block"
          mt={2}
          fontSize="xs"
          color="#E8601C"
          _hover={{ textDecoration: 'underline' }}
        >
          Open PostHog insights →
        </Box>
      </Box>
    )
  }

  return (
    <Box
      as="iframe"
      src={`${posthogHost}/embedded/insight?projectId=${projectId}&insight=FUNNELS`}
      w="full"
      h="208px"
      borderRadius="lg"
      border="none"
      title="PostHog conversion funnel"
    />
  )
}

function SessionReplayLink() {
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com'
  const replayUrl = `${posthogHost}/replay?filter_test_accounts=true&url_contains=/lesson/`

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Box borderRadius="lg" bg="#F9FAFB" _dark={{ bg: '#1C1C1C' }} p={3} display="flex" flexDirection="column" gap={1}>
        <Text fontSize="xs" color="text.secondary">
          Filter: pages containing <Box as="code" fontFamily="mono" fontSize="11px">/lesson/</Box>
        </Text>
        <Text fontSize="xs" color="text.secondary">
          Useful for: drop-off points mid-lesson, exercise confusion, grading latency
        </Text>
      </Box>
      <Box
        as="a"
        href={replayUrl}
        target="_blank"
        rel="noopener noreferrer"
        display="inline-flex"
        alignItems="center"
        gap="6px"
        fontSize="sm"
        fontWeight="medium"
        color="#E8601C"
        _hover={{ textDecoration: 'underline' }}
      >
        Open session replays
        <svg style={{ height: '14px', width: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </Box>
    </Box>
  )
}
