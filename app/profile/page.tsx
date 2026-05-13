'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Box, Flex, Text, SimpleGrid, useColorModeValue, useColorMode } from '@chakra-ui/react'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Toggle } from '@/components/ui/Toggle'

const ACHIEVEMENT_EMOJI_MAP: Record<string, string> = {
  'first-lesson': '\u{1F3AF}',
  'streak-7':     '\u{1F525}',
  'streak-30':    '\u{1F48E}',
  'first-track':  '\u{1F3C6}',
  'level-5':      '\u2B50',
}

interface ProfileData {
  user: {
    id: string
    email: string
    displayName: string
    xpTotal: number
    level: number
    currentStreak: number
    longestStreak: number
    preferences: Record<string, unknown>
  }
  achievements: Array<{
    id: string
    title: string
    description: string
    earnedAt: string | null
  }>
  tracksProgress: Array<{
    trackId: string
    title: string
    color: string
    completedCount: number
    totalCount: number
  }>
}

type AchievementStatus = 'earned' | 'locked'
interface Achievement {
  id: string
  emoji: string
  title: string
  desc: string
  status: AchievementStatus
}

function AchievementBadge({ achievement }: { achievement: Achievement }) {
  const earnedBorder = useColorModeValue('rgba(252,211,77,0.4)', 'rgba(217,119,6,0.3)')
  const earnedBg = useColorModeValue('#FFFBEB', '#2A2210')
  const lockedBorder = useColorModeValue('#E5E7EB', '#2D2D2D')
  const lockedBg = useColorModeValue('#FFFFFF', '#1A1A1A')
  const primaryColor = useColorModeValue('#1A1A1A', '#F5F5F5')
  const mutedColor = useColorModeValue('#9CA3AF', '#6B7280')

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap="6px"
      p={3}
      borderRadius="2xl"
      border="1px solid"
      textAlign="center"
      borderColor={achievement.status === 'earned' ? earnedBorder : lockedBorder}
      bg={achievement.status === 'earned' ? earnedBg : lockedBg}
      opacity={achievement.status === 'locked' ? 0.5 : 1}
    >
      <Text fontSize="2xl" lineHeight={1}>
        {achievement.status === 'locked' ? '\u{1F512}' : achievement.emoji}
      </Text>
      <Text fontSize="11px" fontWeight="semibold" color={primaryColor} lineHeight="tight">
        {achievement.title}
      </Text>
      <Text fontSize="10px" color={mutedColor} lineHeight="tight">
        {achievement.desc}
      </Text>
    </Box>
  )
}

export default function ProfilePage() {
  const { colorMode, setColorMode } = useColorMode()
  const [darkMode, setDarkMode] = useState(colorMode === 'dark')
  const [emailDigest, setEmailDigest] = useState(true)
  const [leaderboard, setLeaderboard] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)

  const heroBg = useColorModeValue('#FFFFFF', '#0F0F0F')
  const bodyBg = useColorModeValue('#FAFAFA', '#0F0F0F')
  const primaryColor = useColorModeValue('#1A1A1A', '#F5F5F5')
  const secondaryColor = useColorModeValue('#6B7280', '#9CA3AF')
  const mutedColor = useColorModeValue('#9CA3AF', '#6B7280')
  const cardBg = useColorModeValue('#FFFFFF', '#1A1A1A')
  const cardBorder = useColorModeValue('#E5E7EB', '#2D2D2D')
  const cardHoverBorder = useColorModeValue('#D1D5DB', '#3D3D3D')
  const dividerColor = useColorModeValue('#F3F4F6', '#2D2D2D')
  const gearHoverBg = useColorModeValue('#F3F4F6', '#252525')

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.ok ? r.json() : null)
      .then((data: ProfileData | null) => {
        if (data) {
          setProfileData(data)
          const prefs = data.user.preferences ?? {}
          setEmailDigest((prefs.emailDigest as boolean | undefined) ?? true)
          setLeaderboard((prefs.leaderboard as boolean | undefined) ?? false)
        }
      })
      .catch(() => {})
  }, [])

  function handleDarkMode(enabled: boolean) {
    setDarkMode(enabled)
    setColorMode(enabled ? 'dark' : 'light')
  }

  async function handleLeaderboardToggle(enabled: boolean) {
    setLeaderboard(enabled)
    await fetch('/api/profile/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leaderboard: enabled }),
    }).catch(() => {})
  }

  async function handleEmailDigestToggle(enabled: boolean) {
    setEmailDigest(enabled)
    await fetch('/api/profile/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailDigest: enabled }),
    }).catch(() => {})
  }

  const streak = profileData?.user.currentStreak ?? 0
  const xpTotal = profileData?.user.xpTotal ?? 0
  const displayName = profileData?.user.displayName ?? 'Learner'
  const email = profileData?.user.email ?? 'you@example.com'

  const STATS = [
    {
      label: 'Day Streak',
      value: String(streak),
      icon: (
        <svg style={{ height: '20px', width: '20px', color: '#E8601C' }} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      label: 'XP Total',
      value: xpTotal.toLocaleString(),
      icon: (
        <svg style={{ height: '20px', width: '20px', color: '#F59E0B' }} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ),
    },
    {
      label: 'League',
      value: 'Wooden',
      icon: (
        <svg style={{ height: '20px', width: '20px', color: '#92400E' }} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
      ),
    },
  ]

  const enrolledTracks = profileData?.tracksProgress.filter(t => t.completedCount > 0) ?? []

  const achievements: Achievement[] = (profileData?.achievements ?? []).map(a => ({
    id: a.id,
    emoji: ACHIEVEMENT_EMOJI_MAP[a.id] ?? '\u{1F396}',
    title: a.title,
    desc: a.description,
    status: a.earnedAt ? 'earned' : 'locked',
  }))

  return (
    <Box mx="-16px" mt="-24px">
      {/* Hero */}
      <Box position="relative" px={4} pt={8} pb={5} bg={heroBg} textAlign="center">
        <Link
          href="/profile/settings"
          style={{ position: 'absolute', top: '20px', right: '16px', padding: '8px', borderRadius: '12px', color: '#9CA3AF' }}
          aria-label="Settings"
        >
          <svg style={{ height: '20px', width: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Link>

        <Box
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          h={24}
          w={24}
          borderRadius="full"
          mb={2}
          boxShadow="lg"
          style={{ background: 'linear-gradient(135deg, #F87171 0%, #E8601C 100%)' }}
        >
          <Text fontSize="32px" fontWeight="bold" color="white" userSelect="none">L</Text>
        </Box>

        <Flex justifyContent="center" mb={2}>
          <Box
            display="inline-flex"
            alignItems="center"
            gap={1}
            px="10px"
            py="2px"
            borderRadius="full"
            bg="#E8601C"
            fontSize="10px"
            fontWeight="bold"
            color="white"
            textTransform="uppercase"
            letterSpacing="widest"
          >
            Free
          </Box>
        </Flex>

        <Text fontSize="22px" fontWeight="bold" color={primaryColor}>{displayName}</Text>

        <Box
          as="button"
          mt={1}
          fontSize="13px"
          color={secondaryColor}
          _hover={{ color: '#E8601C' }}
          transition="colors 0.15s"
        >
          + Add Bio
        </Box>

        <Box mt={4} px={4}>
          <Box
            as="button"
            w="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap={2}
            py="10px"
            borderRadius="full"
            border="2px solid"
            borderColor={cardBorder}
            fontSize="14px"
            fontWeight="semibold"
            color={primaryColor}
            _hover={{ borderColor: '#E8601C', color: '#E8601C' }}
            transition="colors 0.15s"
          >
            <svg style={{ height: '16px', width: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share my progress
          </Box>
        </Box>
      </Box>

      <Box px={4} pb={8} maxW="720px" mx="auto" bg={bodyBg} display="flex" flexDirection="column" gap={5}>
        {/* Stats */}
        <SimpleGrid columns={3} spacing={3} pt={4}>
          {STATS.map(stat => (
            <Box
              key={stat.label}
              display="flex"
              flexDirection="column"
              alignItems="center"
              gap={2}
              bg={cardBg}
              border="1px solid"
              borderColor={cardBorder}
              borderRadius="2xl"
              p={3}
              textAlign="center"
            >
              {stat.icon}
              <Text fontSize="18px" fontWeight="bold" color={primaryColor} sx={{ fontVariantNumeric: "tabular-nums" }} lineHeight={1}>
                {stat.value}
              </Text>
              <Text fontSize="10px" textTransform="uppercase" letterSpacing="wide" color={mutedColor}>
                {stat.label}
              </Text>
            </Box>
          ))}
        </SimpleGrid>

        {/* My Tracks */}
        <Box>
          <Text fontSize="15px" fontWeight="bold" color={primaryColor} mb={2}>My Tracks</Text>
          <Box display="flex" flexDirection="column" gap={2}>
            {enrolledTracks.map(track => {
              const pct = Math.round((track.completedCount / track.totalCount) * 100)
              return (
                <Box
                  key={track.trackId}
                  as={Link}
                  href="/learn"
                  display="flex"
                  alignItems="center"
                  gap={3}
                  bg={cardBg}
                  border="1px solid"
                  borderColor={cardBorder}
                  borderRadius="2xl"
                  p={3}
                  _hover={{ borderColor: cardHoverBorder }}
                  transition="colors 0.15s"
                >
                  <Box
                    h={10}
                    w={10}
                    borderRadius="xl"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                    style={{ backgroundColor: track.color + '22' }}
                  >
                    <Box h={3} w={3} borderRadius="full" style={{ backgroundColor: track.color }} />
                  </Box>
                  <Box flex={1} minW={0}>
                    <Text fontSize="14px" fontWeight="semibold" color={primaryColor} noOfLines={1}>{track.title}</Text>
                    <Flex alignItems="center" gap={2} mt={1}>
                      <Box flex={1}>
                        <ProgressBar value={track.completedCount} max={track.totalCount} color="#2563EB" size="xs" />
                      </Box>
                      <Text fontSize="11px" color={mutedColor} sx={{ fontVariantNumeric: "tabular-nums" }} flexShrink={0}>{pct}%</Text>
                    </Flex>
                  </Box>
                  <svg style={{ height: '16px', width: '16px', color: '#9CA3AF', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Box>
              )
            })}

            <Box
              as={Link}
              href="/library"
              display="flex"
              alignItems="center"
              justifyContent="center"
              w="full"
              py={3}
              borderRadius="2xl"
              border="2px dashed"
              borderColor={cardBorder}
              fontSize="13px"
              color={secondaryColor}
              _hover={{ borderColor: '#E8601C', color: '#E8601C' }}
              transition="colors 0.15s"
            >
              + Explore more tracks
            </Box>
          </Box>
        </Box>

        {/* Friends */}
        <Box>
          <Flex alignItems="center" justifyContent="space-between" mb={2}>
            <Text fontSize="15px" fontWeight="bold" color={primaryColor}>Friends</Text>
            <Box as="button" fontSize="13px" color="#E8601C" fontWeight="semibold" _hover={{ textDecoration: 'underline' }}>
              + Add friends
            </Box>
          </Flex>
          <Box bg={cardBg} border="1px solid" borderColor={cardBorder} borderRadius="2xl" p={6} display="flex" flexDirection="column" alignItems="center" textAlign="center" gap={3}>
            <Flex sx={{ '& > *:not(:first-of-type)': { marginLeft: '-8px' } }}>
              {['#F87171', '#60A5FA', '#34D399'].map((color, i) => (
                <Box
                  key={i}
                  h={10}
                  w={10}
                  borderRadius="full"
                  border="2px solid"
                  borderColor={heroBg}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  style={{ backgroundColor: color }}
                >
                  <Text fontSize="xs" fontWeight="bold" color="white">?</Text>
                </Box>
              ))}
            </Flex>
            <Box>
              <Text fontSize="15px" fontWeight="semibold" color={primaryColor}>No friends yet</Text>
              <Text fontSize="13px" color={secondaryColor} mt="2px" lineHeight="snug">
                Learning is even more fun if you do it together with your friends
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Achievements */}
        <Box>
          <Flex alignItems="center" justifyContent="space-between" mb={2}>
            <Text fontSize="15px" fontWeight="bold" color={primaryColor}>Achievements</Text>
            <Text fontSize="12px" color={mutedColor}>
              {achievements.filter(a => a.status === 'earned').length} / {achievements.length}
            </Text>
          </Flex>
          <SimpleGrid columns={3} spacing={2}>
            {achievements.map(a => (
              <AchievementBadge key={a.id} achievement={a} />
            ))}
          </SimpleGrid>
        </Box>

        {/* Settings */}
        <Box bg={cardBg} border="1px solid" borderColor={cardBorder} borderRadius="2xl" overflow="hidden">
          <Box px={4} py="14px">
            <Text fontSize="15px" fontWeight="bold" color={primaryColor}>Settings</Text>
          </Box>
          <Box px={4} py="14px" borderTop="1px solid" borderColor={dividerColor}>
            <Toggle checked={darkMode} onChange={handleDarkMode} label="Dark mode" description="Switch to a dark color scheme" />
          </Box>
          <Box px={4} py="14px" borderTop="1px solid" borderColor={dividerColor}>
            <Toggle checked={emailDigest} onChange={handleEmailDigestToggle} label="Weekly email digest" description="Get a summary of your progress every Monday" />
          </Box>
          <Box px={4} py="14px" borderTop="1px solid" borderColor={dividerColor}>
            <Toggle checked={leaderboard} onChange={handleLeaderboardToggle} label="Show me on leaderboard" description="Your ranking will be visible to others" />
          </Box>
        </Box>

        {/* Account */}
        <Box bg={cardBg} border="1px solid" borderColor={cardBorder} borderRadius="2xl" overflow="hidden">
          <Flex px={4} py="14px" alignItems="center" justifyContent="space-between" borderBottom="1px solid" borderColor={dividerColor}>
            <Box>
              <Text fontSize="14px" fontWeight="semibold" color={primaryColor}>Email</Text>
              <Text fontSize="12px" color={secondaryColor}>{email}</Text>
            </Box>
            <Box as="button" fontSize="13px" fontWeight="semibold" color="#E8601C" _hover={{ textDecoration: 'underline' }}>Change</Box>
          </Flex>
          <Flex px={4} py="14px" alignItems="center" justifyContent="space-between" borderBottom="1px solid" borderColor={dividerColor}>
            <Box>
              <Text fontSize="14px" fontWeight="semibold" color={primaryColor}>Plan</Text>
              <Text fontSize="12px" color={secondaryColor}>Free &middot; 2 tracks, 3 playground uses/day</Text>
            </Box>
            <Box
              as="button"
              fontSize="13px"
              fontWeight="bold"
              color="white"
              bg="#E8601C"
              _hover={{ bg: '#D4521A' }}
              px={3}
              py="6px"
              borderRadius="xl"
              transition="colors 0.15s"
            >
              Upgrade
            </Box>
          </Flex>
          <Flex px={4} py="14px" alignItems="center" justifyContent="space-between">
            <Text fontSize="14px" fontWeight="semibold" color="#DC2626">Sign out</Text>
            <svg style={{ height: '16px', width: '16px', color: '#9CA3AF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Flex>
        </Box>
      </Box>
    </Box>
  )
}
