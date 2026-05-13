'use client'

import { useEffect, useState } from 'react'
import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react'
import { Button } from '@/components/ui/Button'

interface LeaderboardEntry {
  rank: number
  userId: string
  displayName: string
  level: number
  weeklyXP: number
  isCurrentUser: boolean
}

function getCurrentWeek(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  return Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7)
}

export default function LeaderboardPage() {
  const [optedIn, setOptedIn] = useState<boolean | null>(null)
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [week, setWeek] = useState(getCurrentWeek())
  const [loading, setLoading] = useState(true)
  const [opting, setOpting] = useState(false)

  const primaryColor = useColorModeValue('#1A1A1A', '#F5F5F5')
  const secondaryColor = useColorModeValue('#6B7280', '#9CA3AF')
  const mutedColor = useColorModeValue('#9CA3AF', '#6B7280')
  const panelBg = useColorModeValue('#FFFFFF', '#1A1A1A')
  const panelBorder = useColorModeValue('#E5E7EB', '#2D2D2D')
  const skeletonBg = useColorModeValue('#E5E7EB', '#2D2D2D')
  const pillBg = useColorModeValue('#F3F4F6', '#2D2D2D')
  const iconBg = useColorModeValue('#FFF7ED', '#2D1A10')
  const avatarBg = useColorModeValue('#E5E7EB', '#2D2D2D')
  const avatarTextColor = useColorModeValue('#374151', '#D1D5DB')
  const currentUserRowBg = useColorModeValue('#FFF7ED', '#2D1A10')
  const dividerColor = useColorModeValue('#E5E7EB', '#2D2D2D')

  useEffect(() => {
    Promise.all([
      fetch('/api/profile').then(r => r.ok ? r.json() : null),
      fetch('/api/leaderboard').then(r => r.ok ? r.json() : null),
    ]).then(([profile, leaderboard]) => {
      const prefs = profile?.user?.preferences ?? {}
      setOptedIn((prefs.leaderboard as boolean | undefined) ?? false)
      setEntries(leaderboard?.entries ?? [])
      setWeek(leaderboard?.week ?? getCurrentWeek())
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  async function handleOptIn() {
    setOpting(true)
    try {
      await fetch('/api/profile/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaderboard: true }),
      })
      setOptedIn(true)
      const data = await fetch('/api/leaderboard').then(r => r.ok ? r.json() : null)
      if (data) {
        setEntries(data.entries ?? [])
        setWeek(data.week ?? getCurrentWeek())
      }
    } finally {
      setOpting(false)
    }
  }

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" gap={4} maxW="720px" mx="auto">
        <Box h="32px" w="192px" bg={skeletonBg} borderRadius="md" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
        <Box h="256px" bg={skeletonBg} borderRadius="xl" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
      </Box>
    )
  }

  return (
    <Box display="flex" flexDirection="column" gap={6} maxW="720px" mx="auto">
      <Flex alignItems="flex-start" justifyContent="space-between" gap={4}>
        <Box>
          <Text fontSize="22px" fontWeight="bold" color={primaryColor} mb={1}>Leaderboard</Text>
          <Text fontSize="15px" color={secondaryColor}>
            Weekly XP rankings. Opt-in only — hidden by default.
          </Text>
        </Box>
        <Box
          display="inline-flex"
          alignItems="center"
          px="10px"
          py="2px"
          borderRadius="full"
          fontSize="xs"
          fontWeight="medium"
          bg={pillBg}
          color={secondaryColor}
          flexShrink={0}
        >
          Week {week}
        </Box>
      </Flex>

      {!optedIn ? (
        <Box
          borderRadius="xl"
          border="1px solid"
          borderColor={panelBorder}
          bg={panelBg}
          p={6}
          display="flex"
          flexDirection="column"
          alignItems="center"
          textAlign="center"
          gap={4}
        >
          <Box w={12} h={12} borderRadius="xl" bg={iconBg} display="flex" alignItems="center" justifyContent="center">
            <svg style={{ height: '24px', width: '24px', color: '#D97706' }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </Box>
          <Box>
            <Text fontSize="base" fontWeight="semibold" color={primaryColor}>Join the leaderboard</Text>
            <Text mt={1} fontSize="sm" color={secondaryColor} maxW="xs">
              Opt in to appear on the weekly XP rankings. Your name will be visible to other learners.
            </Text>
          </Box>
          <Button
            variant="primary"
            size="md"
            loading={opting}
            onClick={handleOptIn}
          >
            Show me on the leaderboard
          </Button>
          <Text fontSize="xs" color={mutedColor}>
            You can opt out any time from your profile settings.
          </Text>
        </Box>
      ) : (
        <Box
          borderRadius="xl"
          border="1px solid"
          borderColor={panelBorder}
          bg={panelBg}
          overflow="hidden"
        >
          <Box px={4} py={3} borderBottom="1px solid" borderColor={panelBorder}>
            <Text fontSize="sm" fontWeight="semibold" color={primaryColor}>Top learners this week</Text>
            <Text fontSize="xs" color={secondaryColor}>Ranked by XP earned in the last 7 days</Text>
          </Box>
          {entries.length === 0 ? (
            <Box px={4} py={8} textAlign="center">
              <Text fontSize="sm" color={secondaryColor}>
                No rankings yet this week. Complete lessons to appear here.
              </Text>
            </Box>
          ) : (
            <Box as="ul" listStyleType="none">
              {entries.map(entry => (
                <Flex
                  key={entry.userId}
                  as="li"
                  alignItems="center"
                  gap={3}
                  px={4}
                  py={3}
                  bg={entry.isCurrentUser ? currentUserRowBg : 'transparent'}
                  borderBottom="1px solid"
                  borderColor={dividerColor}
                  _last={{ borderBottom: 'none' }}
                >
                  <Text w="24px" fontSize="sm" fontWeight="medium" color={secondaryColor} sx={{ fontVariantNumeric: "tabular-nums" }}>
                    {entry.rank}
                  </Text>
                  <Flex
                    h={8}
                    w={8}
                    borderRadius="full"
                    bg={avatarBg}
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                  >
                    <Text fontSize="xs" fontWeight="semibold" color={avatarTextColor}>
                      {entry.displayName.slice(0, 2).toUpperCase()}
                    </Text>
                  </Flex>
                  <Box flex={1} minW={0}>
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      noOfLines={1}
                      color={entry.isCurrentUser ? '#EA580C' : primaryColor}
                    >
                      {entry.displayName}
                      {entry.isCurrentUser && ' (you)'}
                    </Text>
                    <Text fontSize="xs" color={mutedColor}>Level {entry.level}</Text>
                  </Box>
                  <Text fontSize="sm" fontWeight="semibold" color="#2563EB" sx={{ fontVariantNumeric: "tabular-nums" }} flexShrink={0}>
                    {entry.weeklyXP.toLocaleString()} XP
                  </Text>
                </Flex>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}
