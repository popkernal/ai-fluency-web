'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Box, Flex, Text, SimpleGrid, useColorModeValue } from '@chakra-ui/react'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { StreakBadge } from '@/components/gamification/StreakBadge'

interface TrackProgress {
  trackId: string
  title: string
  color: string
  description?: string
  completedCount: number
  totalCount: number
  nextLessonId?: string | null
}

interface ProfileData {
  user: { currentStreak: number; xpTotal: number; displayName: string }
  tracksProgress: TrackProgress[]
}

const ALL_TRACKS = [
  { id: 'foundations', title: 'AI Fundamentals',      description: 'Understand how LLMs work, what they can and can\'t do, and how to think about AI as a tool.', color: '#6366F1', stream: 'Foundations', lessonCount: 6 },
  { id: 'prompting',   title: 'Prompt Engineering',   description: 'Master writing precise, effective prompts that get reliable results from any AI model.',        color: '#0EA5E9', stream: 'Foundations', lessonCount: 8 },
  { id: 'cs',          title: 'Critical AI Skills',   description: 'Build the habits and mental models that separate effective AI users from everyone else.',        color: '#8B5CF6', stream: 'Core Skills', lessonCount: 5 },
  { id: 'dw',          title: 'Data Writing',          description: 'Use AI to clean, summarize, and communicate with data more effectively.',                        color: '#10B981', stream: 'Core Skills', lessonCount: 6 },
  { id: 'tw',          title: 'Technical Writing',     description: 'AI-assisted documentation, specs, and technical communication.',                                 color: '#F59E0B', stream: 'Core Skills', lessonCount: 5 },
  { id: 'qw',          title: 'Quick Wins',            description: '10-minute lessons on the highest-leverage AI use cases most people overlook.',                   color: '#EF4444', stream: 'Quick Wins', lessonCount: 5 },
  { id: 'pw',          title: 'Power Workflows',       description: 'Combine AI tools into repeatable workflows that save hours per week.',                           color: '#F97316', stream: 'Quick Wins', lessonCount: 6 },
  { id: 'sl',          title: 'AI for Sales',          description: 'Prospect research, outreach personalisation, and deal intelligence with AI.',                    color: '#06B6D4', stream: 'Role Tracks', lessonCount: 6 },
  { id: 'op',          title: 'AI for Operations',     description: 'Process documentation, SOPs, and operational efficiency through AI.',                            color: '#84CC16', stream: 'Role Tracks', lessonCount: 6 },
  { id: 'pd',          title: 'AI for Product',        description: 'PRDs, user research synthesis, competitive analysis, and roadmap work.',                         color: '#EC4899', stream: 'Role Tracks', lessonCount: 6 },
  { id: 'mk',          title: 'AI for Marketing',      description: 'Content strategy, copy, campaign briefs, and brand voice at scale.',                             color: '#A855F7', stream: 'Role Tracks', lessonCount: 5 },
  { id: 'fn',          title: 'AI for Finance',        description: 'Financial modelling assistance, report drafting, and data interpretation.',                      color: '#14B8A6', stream: 'Role Tracks', lessonCount: 5 },
  { id: 'cx',          title: 'AI for Customer Experience', description: 'Support automation, response quality, and CX insight extraction.',                         color: '#84CC16', stream: 'Role Tracks', lessonCount: 5 },
  { id: 'hr',          title: 'AI for HR & People',    description: 'Job descriptions, interview questions, onboarding materials, and people ops.',                   color: '#F43F5E', stream: 'Role Tracks', lessonCount: 5 },
  { id: 'mc',          title: 'Multi-step Chains',     description: 'Design and run complex multi-step AI workflows and agent-style automations.',                    color: '#6366F1', stream: 'Power User', lessonCount: 8 },
  { id: 'aa',          title: 'AI Agents',             description: 'Understand autonomous AI agents: what they are, how they work, and when to use them.',           color: '#8B5CF6', stream: 'Power User', lessonCount: 8 },
  { id: 'models',      title: 'AI Models Explained',   description: 'Understand the major AI models, their differences, pricing, and how to choose the right one.',   color: '#7C3AED', stream: 'Tools & Reference', lessonCount: 6 },
  { id: 'interfaces',  title: 'Navigating AI Interfaces', description: 'Quick-start guides for ChatGPT, Claude, Gemini, and Perplexity.',                            color: '#0891B2', stream: 'Tools & Reference', lessonCount: 4 },
  { id: 'glossary',    title: 'AI Glossary',           description: 'Clear definitions of the terms you\'ll encounter when working with AI — no jargon, no fluff.',   color: '#059669', stream: 'Tools & Reference', lessonCount: 4 },
]

export default function HomePage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  const primaryColor = useColorModeValue('#1A1A1A', '#F5F5F5')
  const secondaryColor = useColorModeValue('#6B7280', '#9CA3AF')
  const mutedColor = useColorModeValue('#9CA3AF', '#6B7280')
  const skeletonBg = useColorModeValue('#F3F4F6', '#252525')
  const sectionLabelColor = useColorModeValue('#6B7280', '#9CA3AF')
  const streamLabelColor = useColorModeValue('#9CA3AF', '#6B7280')

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.ok ? r.json() : null)
      .then(data => { setProfileData(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const streak = profileData?.user.currentStreak ?? 0
  const displayName = profileData?.user.displayName ?? 'Learner'

  const enrolledTrackIds = new Set(
    (profileData?.tracksProgress ?? [])
      .filter(t => t.completedCount > 0)
      .map(t => t.trackId)
  )

  const enrolledTracks = ALL_TRACKS
    .filter(t => enrolledTrackIds.has(t.id))
    .map(t => {
      const prog = profileData?.tracksProgress.find(p => p.trackId === t.id)
      return { ...t, completedCount: prog?.completedCount ?? 0, totalCount: prog?.totalCount ?? t.lessonCount }
    })

  const libraryTracks = ALL_TRACKS.filter(t => !enrolledTrackIds.has(t.id))

  const libraryByStream = libraryTracks.reduce<Record<string, typeof ALL_TRACKS>>((acc, t) => {
    if (!acc[t.stream]) acc[t.stream] = []
    acc[t.stream].push(t)
    return acc
  }, {})

  return (
    <Box display="flex" flexDirection="column" gap={8} pb={8}>
      {/* Header */}
      <Flex alignItems="flex-start" justifyContent="space-between">
        <Box>
          <Text fontSize="22px" fontWeight="bold" color={primaryColor}>Hi, {displayName}</Text>
          <Text fontSize="sm" color={secondaryColor} mt="2px">
            {enrolledTracks.length > 0 ? 'Pick up where you left off.' : 'Choose a track to get started.'}
          </Text>
        </Box>
        {streak > 0 && <StreakBadge streak={streak} />}
      </Flex>

      {/* Enrolled tracks */}
      {loading ? (
        <Box display="flex" flexDirection="column" gap={3}>
          <Box h="20px" w="128px" bg={skeletonBg} borderRadius="md" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
            {[1, 2].map(i => (
              <Box key={i} h="128px" borderRadius="2xl" bg={skeletonBg} style={{ animation: 'pulse 2s ease-in-out infinite' }} />
            ))}
          </SimpleGrid>
        </Box>
      ) : enrolledTracks.length > 0 ? (
        <Box as="section">
          <Text
            fontSize="xs"
            fontWeight="semibold"
            color={sectionLabelColor}
            textTransform="uppercase"
            letterSpacing="wider"
            mb={3}
          >
            My Tracks
          </Text>
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
            {enrolledTracks.map(track => (
              <EnrolledTrackCard key={track.id} track={track} />
            ))}
          </SimpleGrid>
        </Box>
      ) : null}

      {/* Library */}
      <Box as="section">
        <Text
          fontSize="xs"
          fontWeight="semibold"
          color={sectionLabelColor}
          textTransform="uppercase"
          letterSpacing="wider"
          mb={3}
        >
          {enrolledTracks.length > 0 ? 'Browse Library' : 'Choose a Track'}
        </Text>
        <Box display="flex" flexDirection="column" gap={6}>
          {Object.entries(libraryByStream).map(([stream, tracks]) => (
            <Box key={stream}>
              <Text
                fontSize="11px"
                fontWeight="medium"
                color={streamLabelColor}
                textTransform="uppercase"
                letterSpacing="wider"
                mb={2}
              >
                {stream}
              </Text>
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                {tracks.map(track => (
                  <LibraryTrackCard key={track.id} track={track} />
                ))}
              </SimpleGrid>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}

function EnrolledTrackCard({ track }: {
  track: { id: string; title: string; color: string; description: string; completedCount: number; totalCount: number }
}) {
  const pct = track.totalCount > 0 ? Math.round((track.completedCount / track.totalCount) * 100) : 0
  const isComplete = pct === 100
  const primaryColor = useColorModeValue('#1A1A1A', '#F5F5F5')
  const secondaryColor = useColorModeValue('#6B7280', '#9CA3AF')
  const mutedColor = useColorModeValue('#9CA3AF', '#6B7280')
  const cardBg = useColorModeValue('#FFFFFF', '#1A1A1A')
  const cardBorder = useColorModeValue('#E5E7EB', '#2D2D2D')
  const cardHoverBorder = useColorModeValue('#D1D5DB', '#3D3D3D')
  const trackBg = useColorModeValue('#F3F4F6', '#2D2D2D')
  const completeBadgeBg = useColorModeValue('#F0FDF4', '#0A2918')
  const r = 16
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ

  if (isComplete) {
    return (
      <Box
        as={Link}
        href={'/learn#' + track.id}
        position="relative"
        borderRadius="2xl"
        overflow="hidden"
        border="2px solid"
        borderColor={track.color + '40'}
        bg={cardBg}
        _hover={{ borderColor: track.color + '80' }}
        transition="border-color 0.15s"
        p={5}
        display="flex"
        flexDirection="column"
        gap={3}
        style={{ backgroundImage: `linear-gradient(135deg, ${track.color}10 0%, transparent 60%)` }}
      >
        {/* Solid color top bar */}
        <Box position="absolute" top={0} left={0} right={0} h="4px" borderTopLeftRadius="2xl" borderTopRightRadius="2xl" style={{ backgroundColor: track.color }} />

        <Flex alignItems="flex-start" justifyContent="space-between" gap={2} pt={1}>
          <Box flex={1} minW={0}>
            <Flex alignItems="center" gap={2} mb={1}>
              <Text fontSize="sm" fontWeight="semibold" color={primaryColor} lineHeight="snug">{track.title}</Text>
            </Flex>
            <Text fontSize="xs" color={secondaryColor} noOfLines={2} lineHeight="relaxed">{track.description}</Text>
          </Box>
          {/* Checkmark badge */}
          <Box
            flexShrink={0}
            h={10}
            w={10}
            borderRadius="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
            style={{ backgroundColor: track.color }}
          >
            <svg style={{ height: '18px', width: '18px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </Box>
        </Flex>

        <Flex alignItems="center" justifyContent="space-between">
          <Box
            display="inline-flex"
            alignItems="center"
            gap={1}
            px={2}
            py="3px"
            borderRadius="full"
            bg={completeBadgeBg}
          >
            <Text fontSize="11px" fontWeight="semibold" color="#059669">
              {track.totalCount} of {track.totalCount} complete ✓
            </Text>
          </Box>
          <Text fontSize="xs" fontWeight="semibold" color={mutedColor}>
            Review &rarr;
          </Text>
        </Flex>
      </Box>
    )
  }

  return (
    <Box
      as={Link}
      href={'/learn#' + track.id}
      position="relative"
      borderRadius="2xl"
      overflow="hidden"
      border="1px solid"
      borderColor={cardBorder}
      bg={cardBg}
      _hover={{ borderColor: cardHoverBorder }}
      transition="colors 0.15s"
      p={5}
      display="flex"
      flexDirection="column"
      gap={3}
    >
      <Box position="absolute" top={0} left={0} right={0} h="4px" borderTopLeftRadius="2xl" borderTopRightRadius="2xl" style={{ backgroundColor: track.color }} />

      <Flex alignItems="flex-start" justifyContent="space-between" gap={2} pt={1}>
        <Box flex={1} minW={0}>
          <Text fontSize="sm" fontWeight="semibold" color={primaryColor} lineHeight="snug">{track.title}</Text>
          <Text fontSize="xs" color={secondaryColor} mt={1} noOfLines={2} lineHeight="relaxed">{track.description}</Text>
        </Box>
        <Box flexShrink={0} position="relative" h={10} w={10}>
          <svg style={{ height: '40px', width: '40px', transform: 'rotate(-90deg)' }} viewBox="0 0 40 40">
            <circle cx="20" cy="20" r={r} fill="none" stroke={trackBg} strokeWidth="3" />
            <circle cx="20" cy="20" r={r} fill="none" stroke={track.color} strokeWidth="3" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
          </svg>
          <Text position="absolute" inset={0} display="flex" alignItems="center" justifyContent="center" fontSize="9px" fontWeight="bold" sx={{ fontVariantNumeric: "tabular-nums" }} style={{ color: track.color }}>
            {pct}%
          </Text>
        </Box>
      </Flex>

      <Box>
        <Flex justifyContent="space-between" fontSize="11px" color={mutedColor} mb="6px">
          <Text>{track.completedCount} of {track.totalCount} lessons</Text>
          <Text>{pct}%</Text>
        </Flex>
        <Box h="6px" w="full" bg={trackBg} borderRadius="full" overflow="hidden">
          <Box h="full" borderRadius="full" transition="width 0.3s" style={{ width: `${pct}%`, backgroundColor: track.color }} />
        </Box>
      </Box>

      <Text fontSize="xs" fontWeight="semibold" style={{ color: track.color }}>
        Continue &rarr;
      </Text>
    </Box>
  )
}

function LibraryTrackCard({ track }: { track: { id: string; title: string; color: string; description: string; lessonCount: number } }) {
  const primaryColor = useColorModeValue('#1A1A1A', '#F5F5F5')
  const secondaryColor = useColorModeValue('#6B7280', '#9CA3AF')
  const mutedColor = useColorModeValue('#9CA3AF', '#6B7280')
  const cardBg = useColorModeValue('#FFFFFF', '#1A1A1A')
  const cardBorder = useColorModeValue('#E5E7EB', '#2D2D2D')
  const cardHoverBorder = useColorModeValue('#D1D5DB', '#3D3D3D')

  return (
    <Box
      as={Link}
      href={'/learn#' + track.id}
      borderRadius="2xl"
      overflow="hidden"
      border="1px solid"
      borderColor={cardBorder}
      bg={cardBg}
      _hover={{ borderColor: cardHoverBorder }}
      transition="colors 0.15s"
      p={5}
      display="flex"
      flexDirection="column"
      gap={2}
    >
      <Flex alignItems="center" gap="10px">
        <Box h="10px" w="10px" borderRadius="full" flexShrink={0} style={{ backgroundColor: track.color }} />
        <Text fontSize="sm" fontWeight="semibold" color={primaryColor} lineHeight="snug">{track.title}</Text>
      </Flex>
      <Text fontSize="xs" color={secondaryColor} lineHeight="relaxed" noOfLines={2}>{track.description}</Text>
      <Flex alignItems="center" justifyContent="space-between" mt={1}>
        <Text fontSize="11px" color={mutedColor}>{track.lessonCount} lessons</Text>
        <Box
          as="span"
          fontSize="xs"
          fontWeight="semibold"
          px="10px"
          py={1}
          borderRadius="lg"
          transition="colors 0.15s"
          style={{ backgroundColor: track.color + '18', color: track.color }}
        >
          Start &rarr;
        </Box>
      </Flex>
    </Box>
  )
}
