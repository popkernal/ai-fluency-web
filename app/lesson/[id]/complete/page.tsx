'use client'

import Link from 'next/link'
import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react'
import { ProgressBar } from '@/components/ui/ProgressBar'

const RESULT = {
  lessonTitle: 'Writing precise instructions',
  track: 'Prompt Engineering',
  lessonId: 'pf-001',
  nextLessonId: 'pf-002',
  nextLessonTitle: 'Context windows explained',
  exercises: 8,
  xpEarned: 60,
  accuracy: 87,
  xpToday: 180,
  xpGoal: 200,
}

const ENCOURAGEMENTS = [
  "You're building real skills.",
  'Consistency beats perfection.',
  'One more lesson closer to mastery.',
  'Great work — keep the momentum going!',
]

const encouragement = ENCOURAGEMENTS[new Date().getDate() % ENCOURAGEMENTS.length]

function StatPill({
  icon,
  value,
  label,
  bgColor,
}: {
  icon: React.ReactNode
  value: string
  label: string
  bgColor: string
}) {
  const primaryColor = useColorModeValue('#1A1A1A', '#F5F5F5')
  const secondaryColor = useColorModeValue('#6B7280', '#9CA3AF')

  return (
    <Flex flexDirection="column" alignItems="center" gap={1} flex={1}>
      <Box
        h={10}
        w={10}
        borderRadius="xl"
        display="flex"
        alignItems="center"
        justifyContent="center"
        style={{ backgroundColor: bgColor }}
      >
        {icon}
      </Box>
      <Text fontSize="18px" fontWeight="bold" color={primaryColor} sx={{ fontVariantNumeric: "tabular-nums" }}>{value}</Text>
      <Text fontSize="10px" color={secondaryColor}>{label}</Text>
    </Flex>
  )
}

export default function LessonCompletePage() {
  const bgColor = useColorModeValue('#FAFAFA', '#0F0F0F')
  const primaryColor = useColorModeValue('#1A1A1A', '#F5F5F5')
  const secondaryColor = useColorModeValue('#6B7280', '#9CA3AF')
  const mutedColor = useColorModeValue('#9CA3AF', '#6B7280')
  const cardBg = useColorModeValue('#FFFFFF', '#1A1A1A')
  const cardBorder = useColorModeValue('#E5E7EB', '#2D2D2D')
  const cardHoverBorder = useColorModeValue('#D1D5DB', '#3D3D3D')
  const statPillBgBlue = useColorModeValue('#EFF6FF', '#0A1628')
  const statPillBgYellow = useColorModeValue('#FFFBEB', '#2A2210')
  const statPillBgGreen = useColorModeValue('#F0FDF4', '#0A2010')

  return (
    <Box
      minH="calc(100vh - 4rem)"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      px={4}
      mx="-16px"
      mt="-24px"
      bg={bgColor}
    >
      <Box w="full" maxW="sm" display="flex" flexDirection="column" gap={7}>
        {/* Celebration */}
        <Box textAlign="center" display="flex" flexDirection="column" gap={3}>
          <Text fontSize="6xl" userSelect="none">🎉</Text>
          <Box>
            <Text fontSize="22px" fontWeight="bold" color={primaryColor}>Lesson complete!</Text>
            <Text fontSize="sm" color={secondaryColor} mt={1}>{RESULT.lessonTitle}</Text>
          </Box>
        </Box>

        {/* Stats */}
        <Box bg={cardBg} border="1px solid" borderColor={cardBorder} borderRadius="2xl" p={5}>
          <Flex justifyContent="space-around" gap={2}>
            <StatPill
              icon={
                <svg style={{ height: '20px', width: '20px', color: '#2563EB' }} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              }
              value={String(RESULT.exercises)}
              label="Exercises"
              bgColor={statPillBgBlue}
            />
            <StatPill
              icon={
                <svg style={{ height: '20px', width: '20px', color: '#F59E0B' }} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              }
              value={'+' + RESULT.xpEarned}
              label="XP earned"
              bgColor={statPillBgYellow}
            />
            <StatPill
              icon={
                <svg style={{ height: '20px', width: '20px', color: '#059669' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              }
              value={RESULT.accuracy + '%'}
              label="Accuracy"
              bgColor={statPillBgGreen}
            />
          </Flex>
        </Box>

        <Text textAlign="center" fontSize="sm" fontWeight="medium" color={secondaryColor}>
          {encouragement}
        </Text>

        {/* Daily XP goal */}
        <Box bg={cardBg} border="1px solid" borderColor={cardBorder} borderRadius="xl" p={4} display="flex" flexDirection="column" gap={2}>
          <Flex alignItems="center" justifyContent="space-between">
            <Text fontSize="sm" fontWeight="medium" color={primaryColor}>Daily XP goal</Text>
            <Text fontSize="sm" fontWeight="semibold" color="#E8601C" sx={{ fontVariantNumeric: "tabular-nums" }}>
              {RESULT.xpToday} / {RESULT.xpGoal} XP
            </Text>
          </Flex>
          <ProgressBar value={RESULT.xpToday} max={RESULT.xpGoal} color="#E8601C" size="md" />
          {RESULT.xpToday >= RESULT.xpGoal ? (
            <Text fontSize="xs" fontWeight="medium" color="#059669">Goal reached today!</Text>
          ) : (
            <Text fontSize="xs" color={secondaryColor}>
              {RESULT.xpGoal - RESULT.xpToday} XP to reach today's goal
            </Text>
          )}
        </Box>

        {/* Next lesson card */}
        <Box borderRadius="xl" border="1px solid" borderColor={cardBorder} bg={cardBg} p={4}>
          <Text fontSize="xs" fontWeight="semibold" color={mutedColor} textTransform="uppercase" letterSpacing="wider" mb={1}>
            Up next
          </Text>
          <Text fontSize="sm" fontWeight="medium" color={primaryColor}>{RESULT.nextLessonTitle}</Text>
          <Text fontSize="xs" color={mutedColor} mt="2px">{RESULT.track}</Text>
        </Box>

        {/* CTAs */}
        <Box display="flex" flexDirection="column" gap={3} pb={6}>
          <Link
            href={'/lesson/' + RESULT.nextLessonId}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'center',
              padding: '14px',
              borderRadius: '12px',
              background: '#E8601C',
              color: 'white',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Continue &rarr;
          </Link>
          <Link
            href="/"
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'center',
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid',
              borderColor: 'var(--card-border)',
              fontSize: '14px',
              color: '#6B7280',
              textDecoration: 'none',
            }}
          >
            Back to home
          </Link>
        </Box>
      </Box>
    </Box>
  )
}
