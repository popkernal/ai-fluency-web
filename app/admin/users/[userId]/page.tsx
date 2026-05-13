import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Box, Flex, Text, SimpleGrid } from '@chakra-ui/react'
import { getAdminUserDetail } from '@/lib/adminEngine'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { getXPToNextLevel } from '@/lib/xpEngine'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ userId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { userId } = await params
  const user = await getAdminUserDetail(userId)
  if (!user) return { title: 'User Not Found — Admin' }
  return { title: user.email + ' — Admin' }
}

export default async function UserDetailPage({ params }: Props) {
  const { userId } = await params
  const user = await getAdminUserDetail(userId)
  if (!user) notFound()

  const xpProgress = getXPToNextLevel(user.xpTotal)

  const planBadgeColors: Record<string, { bg: string; color: string }> = {
    free:       { bg: '#F3F4F6', color: '#6B7280' },
    pro:        { bg: '#EFF6FF', color: '#1D4ED8' },
    team:       { bg: '#F5F3FF', color: '#7C3AED' },
    enterprise: { bg: '#FFFBEB', color: '#B45309' },
  }
  const planColors = planBadgeColors[user.plan] ?? planBadgeColors.free

  return (
    <Box display="flex" flexDirection="column" gap={6} maxW="4xl">
      {/* Back */}
      <Box
        as={Link}
        href="/admin/users"
        display="inline-flex"
        alignItems="center"
        gap={1}
        fontSize="sm"
        color="text.secondary"
        _hover={{ color: '#E8601C' }}
        transition="colors 0.15s"
      >
        ← Users
      </Box>

      {/* Header */}
      <Flex alignItems="flex-start" justifyContent="space-between" gap={4}>
        <Box>
          <Text fontSize="22px" fontWeight="bold" color="text.primary">{user.displayName}</Text>
          <Text fontSize="sm" color="text.secondary" mt="2px">{user.email}</Text>
          {user.orgName && (
            <Text fontSize="xs" color="text.secondary" mt={1}>Org: {user.orgName}</Text>
          )}
        </Box>
        <Box
          as="span"
          display="inline-flex"
          px="10px"
          py={1}
          borderRadius="full"
          fontSize="xs"
          fontWeight="semibold"
          style={{ backgroundColor: planColors.bg, color: planColors.color }}
        >
          {user.plan}
        </Box>
      </Flex>

      {/* Stat cards */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={3}>
        <StatCard label="Level" value={String(user.level)} />
        <StatCard label="Total XP" value={user.xpTotal.toLocaleString()} />
        <StatCard label="Current streak" value={user.currentStreak > 0 ? user.currentStreak + 'd' : '—'} />
        <StatCard label="Longest streak" value={user.longestStreak > 0 ? user.longestStreak + 'd' : '—'} />
        <StatCard label="Lessons completed" value={String(user.lessonsCompleted)} />
        <StatCard label="Total submissions" value={String(user.totalAttempts)} />
        <StatCard label="Avg score" value={user.avgScore !== null ? user.avgScore + '%' : '—'} />
        <StatCard
          label="Member since"
          value={new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
        />
      </SimpleGrid>

      {/* XP progress */}
      <Box
        borderRadius="xl" border="1px solid" borderColor="border.default"
        bg="surface" p={4} display="flex" flexDirection="column" gap={2}
      >
        <Flex alignItems="center" justifyContent="space-between" fontSize="sm">
          <Text fontWeight="medium" color="text.primary">Level {user.level} progress</Text>
          <Text fontSize="xs" color="text.secondary" sx={{ fontVariantNumeric: "tabular-nums" }}>
            {xpProgress.current} / {xpProgress.needed} XP
          </Text>
        </Flex>
        <ProgressBar value={xpProgress.percentage} showLabel={false} />
      </Box>

      {/* Recent activity */}
      {user.recentActivity.length > 0 && (
        <Box
          borderRadius="xl" border="1px solid" borderColor="border.default"
          bg="surface" p={4} display="flex" flexDirection="column" gap={3}
        >
          <Text fontSize="sm" fontWeight="semibold" color="text.primary">Recent activity (last 14 days)</Text>
          <Box overflowX="auto">
            <Box as="table" w="full" style={{ fontSize: '14px', borderCollapse: 'collapse' }}>
              <Box as="thead">
                <Box as="tr" style={{ fontSize: '12px', color: '#9CA3AF' }}>
                  <Box as="th" style={{ textAlign: 'left', paddingBottom: 6, paddingRight: 16 }}>Date</Box>
                  <Box as="th" style={{ textAlign: 'right', paddingBottom: 6, paddingRight: 16 }}>Lessons</Box>
                  <Box as="th" style={{ textAlign: 'right', paddingBottom: 6 }}>XP earned</Box>
                </Box>
              </Box>
              <Box as="tbody">
                {user.recentActivity.map(a => (
                  <Box key={a.date} as="tr" style={{ borderTop: '1px solid rgba(229,231,235,0.6)' }}>
                    <Box as="td" style={{ padding: '6px 16px 6px 0', fontSize: '12px', color: '#374151' }}>{a.date}</Box>
                    <Box as="td" style={{ padding: '6px 16px 6px 0', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{a.lessonsCompleted}</Box>
                    <Box as="td" style={{ padding: '6px 0', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: '#E8601C' }}>+{a.xpEarned}</Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Box borderRadius="xl" border="1px solid" borderColor="border.default" bg="surface" p={4}>
      <Text fontSize="xs" color="text.secondary">{label}</Text>
      <Text fontSize="xl" fontWeight="bold" color="text.primary" sx={{ fontVariantNumeric: "tabular-nums" }} mt={1}>{value}</Text>
    </Box>
  )
}
