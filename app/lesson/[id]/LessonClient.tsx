'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react'

import { ExplanationBlock } from '@/components/lesson/ExplanationBlock'
import { ExampleBlock } from '@/components/lesson/ExampleBlock'
import { MultipleChoiceExercise } from '@/components/lesson/MultipleChoiceExercise'
import { SpotTheErrorExercise } from '@/components/lesson/SpotTheErrorExercise'
import { FillInBlankExercise } from '@/components/lesson/FillInBlankExercise'
import { OrderTheStepsExercise } from '@/components/lesson/OrderTheStepsExercise'
import { PromptExercise } from '@/components/lesson/PromptExercise'
import { RewriteExercise } from '@/components/lesson/RewriteExercise'

import type { Lesson, LessonSection } from '@/types'
import { LevelUpNotice } from '@/components/gamification/LevelUpNotice'
import { AchievementToast } from '@/components/gamification/AchievementToast'

interface LessonClientProps {
  lesson: Lesson
}

const TRACK_COLORS: Record<string, string> = {
  foundations:  '#6366F1',
  prompting:    '#0EA5E9',
  context:      '#8B5CF6',
  reasoning:    '#F59E0B',
  coding:       '#10B981',
  writing:      '#EC4899',
  data:         '#14B8A6',
  multimodal:   '#F97316',
  agents:       '#EF4444',
  evaluation:   '#A855F7',
  ethics:       '#84CC16',
  advanced:     '#06B6D4',
}

function CompletionScreen({
  lesson,
  scores,
  xpEarned,
  nextLessonId,
  onRestart,
}: {
  lesson: Lesson
  scores: number[]
  xpEarned: number
  nextLessonId: string | null
  onRestart: () => void
}) {
  const primaryColor = useColorModeValue('#1A1A1A', '#F5F5F5')
  const secondaryColor = useColorModeValue('#6B7280', '#9CA3AF')
  const dividerColor = useColorModeValue('#E5E7EB', '#2D2D2D')
  const exerciseScores = scores.filter(s => s >= 0)
  const avgScore = exerciseScores.length > 0
    ? Math.round(exerciseScores.reduce((a, b) => a + b, 0) / exerciseScores.length)
    : 100
  const trackColor = TRACK_COLORS[lesson.trackId] ?? '#2563EB'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Flex flexDirection="column" alignItems="center" textAlign="center" gap={6} py={8}>
        <Box
          w={16}
          h={16}
          borderRadius="20px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          style={{ backgroundColor: trackColor }}
        >
          <svg style={{ height: '36px', width: '36px', color: 'white' }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </Box>

        <Box>
          <Text fontSize="13px" fontWeight="semibold" color={secondaryColor} textTransform="uppercase" letterSpacing="wide" mb={1}>
            Lesson complete
          </Text>
          <Text fontSize="22px" fontWeight="bold" color={primaryColor} lineHeight="tight">
            {lesson.title}
          </Text>
        </Box>

        <Flex alignItems="center" gap={6}>
          <Box textAlign="center">
            <Text fontSize="24px" fontWeight="bold" color={primaryColor}>{avgScore}</Text>
            <Text fontSize="12px" color={secondaryColor}>Score</Text>
          </Box>
          <Box w="1px" h={10} bg={dividerColor} />
          <Box textAlign="center">
            <Text fontSize="24px" fontWeight="bold" color="#F59E0B">+{xpEarned}</Text>
            <Text fontSize="12px" color={secondaryColor}>XP earned</Text>
          </Box>
          <Box w="1px" h={10} bg={dividerColor} />
          <Box textAlign="center">
            <Text fontSize="24px" fontWeight="bold" color={primaryColor}>{lesson.estimatedMinutes}m</Text>
            <Text fontSize="12px" color={secondaryColor}>Completed</Text>
          </Box>
        </Flex>

        <Box w="full" display="flex" flexDirection="column" gap={2} maxW="xs">
          {nextLessonId ? (
            <Link
              href={`/lesson/${nextLessonId}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '44px',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 600,
                color: 'white',
                backgroundColor: trackColor,
                textDecoration: 'none',
              }}
            >
              Next lesson &rarr;
            </Link>
          ) : (
            <Link
              href="/learn"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '44px',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 600,
                color: 'white',
                backgroundColor: '#2563EB',
                textDecoration: 'none',
              }}
            >
              Back to learning path &rarr;
            </Link>
          )}
          <Link
            href="/learn"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '36px',
              borderRadius: '12px',
              fontSize: '14px',
              color: '#6B7280',
              textDecoration: 'none',
            }}
          >
            Back to map
          </Link>
        </Box>
      </Flex>
    </motion.div>
  )
}

function ExerciseSection({
  section,
  lessonId,
  trackColor,
  onComplete,
}: {
  section: Extract<LessonSection, { type: 'exercise' }>
  lessonId: string
  trackColor: string
  onComplete: (score: number) => void
}) {
  const { exerciseType, prompt, data } = section
  const d = data as Record<string, unknown>

  if (exerciseType === 'multiple_choice') {
    return <MultipleChoiceExercise prompt={prompt} data={d as { choices: string[]; correctIndex: number; explanation: string }} onComplete={onComplete} />
  }
  if (exerciseType === 'spot_the_error') {
    return <SpotTheErrorExercise prompt={prompt} data={d as { segments: string[]; errorIndex: number; explanation: string }} onComplete={onComplete} />
  }
  if (exerciseType === 'fill_in_blank') {
    return <FillInBlankExercise prompt={prompt} data={d as { template: string; blanks: Array<{ hint: string; acceptable: string[] }>; explanation?: string }} onComplete={onComplete} />
  }
  if (exerciseType === 'order_the_steps') {
    return <OrderTheStepsExercise prompt={prompt} data={d as { steps: string[]; correctOrder: number[]; explanation?: string }} onComplete={onComplete} />
  }
  if (exerciseType === 'rewrite') {
    return <RewriteExercise lessonId={lessonId} prompt={prompt} data={d as { original: string; hints?: string[]; rubric: string[] }} onComplete={onComplete} />
  }
  return <PromptExercise lessonId={lessonId} prompt={prompt} data={d as { scenario?: string; hints?: string[]; rubric: string[] }} onComplete={onComplete} />
}

export function LessonClient({ lesson }: LessonClientProps) {
  const router = useRouter()
  const [currentSection, setCurrentSection] = useState(0)
  const [sectionScores, setSectionScores] = useState<number[]>(lesson.sections.map(() => -1))
  const [completed, setCompleted] = useState(false)
  const [xpEarned, setXpEarned] = useState(lesson.xpReward)
  const [nextLessonId, setNextLessonId] = useState<string | null>(null)
  const [canContinue, setCanContinue] = useState(false)
  const [levelUp, setLevelUp] = useState<number | null>(null)
  const [achievementQueue, setAchievementQueue] = useState<Array<{ id: string; title: string; description: string }>>([])

  const bgColor = useColorModeValue('#FAFAFA', '#0F0F0F')
  const borderColor = useColorModeValue('#E5E7EB', '#2D2D2D')
  const primaryColor = useColorModeValue('#1A1A1A', '#F5F5F5')
  const secondaryColor = useColorModeValue('#6B7280', '#9CA3AF')

  const startTime = useRef(Date.now())
  const contentRef = useRef<HTMLDivElement>(null)

  const total = lesson.sections.length
  const trackColor = TRACK_COLORS[lesson.trackId] ?? '#2563EB'

  useEffect(() => {
    const section = lesson.sections[currentSection]
    if (section.type !== 'exercise') {
      setCanContinue(true)
    } else {
      setCanContinue(false)
    }
  }, [currentSection, lesson.sections])

  function handleExerciseComplete(score: number) {
    setSectionScores(prev => {
      const next = [...prev]
      next[currentSection] = score
      return next
    })
    setCanContinue(true)
  }

  async function handleContinue() {
    if (!canContinue) return

    if (currentSection < total - 1) {
      setCurrentSection(s => s + 1)
      setCanContinue(false)
      contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      const durationSeconds = Math.round((Date.now() - startTime.current) / 1000)
      const exerciseScores = sectionScores.filter(s => s >= 0)
      const avgScore = exerciseScores.length > 0
        ? Math.round(exerciseScores.reduce((a, b) => a + b, 0) / exerciseScores.length)
        : 100

      try {
        const res = await fetch('/api/lesson/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lessonId: lesson.id, score: avgScore, durationSeconds }),
        })
        if (res.ok) {
          const data = await res.json()
          setXpEarned(data.xpEarned ?? lesson.xpReward)
          setNextLessonId(data.nextLessonId ?? null)
          if (data.newLevel) setLevelUp(data.newLevel)
          if (data.newAchievements?.length) setAchievementQueue(data.newAchievements)
        }
      } catch {
        // Non-fatal
      }

      setCompleted(true)
    }
  }

  if (completed) {
    return (
      <Box maxW="720px" mx="auto" px={4} py={8}>
        <CompletionScreen
          lesson={lesson}
          scores={sectionScores}
          xpEarned={xpEarned}
          nextLessonId={nextLessonId}
          onRestart={() => {
            setCurrentSection(0)
            setSectionScores(lesson.sections.map(() => -1))
            setCompleted(false)
            startTime.current = Date.now()
          }}
        />
      </Box>
    )
  }

  const section = lesson.sections[currentSection]

  return (
    <Box minH="100vh" display="flex" flexDirection="column" bg={bgColor}>
      {/* Progress bar + nav */}
      <Box position="sticky" top={0} zIndex={20} bg={bgColor} borderBottom="1px solid" borderColor={borderColor}>
        <Box h={1} bg={borderColor}>
          <Box
            h="full"
            transition="width 0.5s ease-out"
            style={{ width: `${((currentSection + 1) / total) * 100}%`, backgroundColor: trackColor }}
          />
        </Box>

        <Flex alignItems="center" justifyContent="space-between" px={4} py={3} maxW="720px" mx="auto">
          <Link
            href="/learn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: secondaryColor, textDecoration: 'none' }}
          >
            <svg style={{ height: '16px', width: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span style={{ fontSize: '13px', fontWeight: 500 }}>Map</span>
          </Link>

          <Text fontSize="13px" color={secondaryColor}>
            {currentSection + 1} / {total}
          </Text>

          <Flex alignItems="center" gap={1} bg="#FFFBEB" border="1px solid rgba(252,211,77,0.4)" borderRadius="lg" px={2} py="2px">
            <svg style={{ height: '12px', width: '12px', color: '#F59E0B' }} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <Text fontSize="11px" fontWeight="bold" color="#F59E0B">+{lesson.xpReward} XP</Text>
          </Flex>
        </Flex>
      </Box>

      {/* Content */}
      <Box flex={1} maxW="720px" mx="auto" w="full" px={4} py={8} pb={28} ref={contentRef}>
        {currentSection === 0 && (
          <Box mb={6}>
            <Flex alignItems="center" gap={2} mb={2}>
              <Box h={3} w={3} borderRadius="full" style={{ backgroundColor: trackColor }} />
              <Text fontSize="12px" fontWeight="semibold" color={secondaryColor} textTransform="uppercase" letterSpacing="wide">
                {lesson.trackId.charAt(0).toUpperCase() + lesson.trackId.slice(1)}
              </Text>
            </Flex>
            <Text fontSize="22px" fontWeight="bold" color={primaryColor} lineHeight="snug">
              {lesson.title}
            </Text>
          </Box>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {section.type === 'explanation' && (
              <ExplanationBlock content={section.content} trackColor={trackColor} />
            )}
            {section.type === 'example' && (
              <ExampleBlock bad={section.bad} good={section.good} explanation={section.explanation} />
            )}
            {section.type === 'exercise' && (
              <Box>
                <Flex alignItems="center" gap={2} mb={4}>
                  <Box
                    as="span"
                    fontSize="11px"
                    fontWeight="bold"
                    textTransform="uppercase"
                    letterSpacing="wider"
                    px="10px"
                    py={1}
                    borderRadius="full"
                    color="white"
                    style={{ backgroundColor: trackColor }}
                  >
                    Exercise
                  </Box>
                </Flex>
                <ExerciseSection
                  section={section}
                  lessonId={lesson.id}
                  trackColor={trackColor}
                  onComplete={handleExerciseComplete}
                />
              </Box>
            )}
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Sticky Continue button */}
      {(section.type !== 'exercise' || canContinue) && (
        <Box
          position="fixed"
          bottom={0}
          left={0}
          right={0}
          zIndex={20}
          bg={bgColor}
          borderTop="1px solid"
          borderColor={borderColor}
          px={4}
          py={4}
          sx={{ backdropFilter: 'blur(4px)' }}
        >
          <Box maxW="720px" mx="auto">
            <Box
              as="button"
              onClick={handleContinue}
              disabled={!canContinue}
              w="full"
              h={11}
              borderRadius="xl"
              fontSize="15px"
              fontWeight="semibold"
              color="white"
              transition="opacity 0.2s"
              _disabled={{ opacity: 0.4, pointerEvents: 'none' }}
              _hover={{ opacity: 0.9 }}
              style={{ backgroundColor: trackColor }}
            >
              {currentSection < total - 1 ? 'Continue \u2192' : 'Finish lesson \u2192'}
            </Box>
          </Box>
        </Box>
      )}

      {/* Overlay notifications */}
      <Box position="fixed" top={4} right={4} zIndex={50} display="flex" flexDirection="column" gap={2} maxW="sm" pointerEvents="none">
        <AnimatePresence>
          {levelUp !== null && (
            <LevelUpNotice newLevel={levelUp} onDismiss={() => setLevelUp(null)} />
          )}
          {achievementQueue[0] && (
            <AchievementToast
              key={achievementQueue[0].id}
              achievement={achievementQueue[0]}
              onDismiss={() => setAchievementQueue(prev => prev.slice(1))}
            />
          )}
        </AnimatePresence>
      </Box>
    </Box>
  )
}
