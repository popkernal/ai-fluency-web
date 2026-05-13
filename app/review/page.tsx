'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { ReviewCard, type ReviewCardItem } from '@/components/review/ReviewCard'
import { ReviewProgress } from '@/components/review/ReviewProgress'
import { StrengthIndicator } from '@/components/review/StrengthIndicator'

interface ReviewResult {
  xpEarned: number
  newStrength: number
}

export default function ReviewPage() {
  const [items, setItems] = useState<ReviewCardItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [completed, setCompleted] = useState(0)
  const [lastResult, setLastResult] = useState<ReviewResult | null>(null)
  const [showStrength, setShowStrength] = useState(false)
  const [allDone, setAllDone] = useState(false)
  const [totalXPEarned, setTotalXPEarned] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const pageBg = useColorModeValue('#FAFAFA', '#111111')
  const primaryColor = useColorModeValue('#1A1A1A', '#F5F5F5')
  const secondaryColor = useColorModeValue('#6B7280', '#9CA3AF')
  const skeletonBg = useColorModeValue('#E5E7EB', '#2D2D2D')
  const panelBg = useColorModeValue('#FFFFFF', '#1A1A1A')
  const panelBorder = useColorModeValue('#E5E7EB', '#2D2D2D')
  const successBg = useColorModeValue('#F0FDF4', '#0A2918')
  const backLinkColor = useColorModeValue('#6B7280', '#9CA3AF')
  const backLinkHoverColor = useColorModeValue('#1A1A1A', '#F5F5F5')

  useEffect(() => {
    fetch('/api/review')
      .then(r => r.json())
      .then(data => {
        setItems(data.items ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function handleExerciseComplete(score: number) {
    if (submitting) return
    const item = items[currentIdx]
    if (!item) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: item.lessonId,
          exerciseIndex: item.exerciseIndex,
          score,
        }),
      })
      const data = await res.json()
      const xpEarned = (data.xpEarned as number) ?? 5
      const newStrength = (data.newStrength as number) ?? 0

      setLastResult({ xpEarned, newStrength })
      setTotalXPEarned(prev => prev + xpEarned)
      setCompleted(prev => prev + 1)
      toast(`+${xpEarned} XP`, { variant: 'success', duration: 2500 })
      setShowStrength(true)
    } catch {
      toast('Failed to submit review', { variant: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  function handleNext() {
    setShowStrength(false)
    setLastResult(null)
    if (currentIdx + 1 >= items.length) {
      setAllDone(true)
    } else {
      setCurrentIdx(prev => prev + 1)
    }
  }

  if (loading) {
    return (
      <Box minH="100vh" bg={pageBg}>
        <Box maxW="lg" mx="auto" px={4} py={8} display="flex" flexDirection="column" gap={4}>
          <Box h="24px" w="192px" bg={skeletonBg} borderRadius="md" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
          <Box h="256px" bg={skeletonBg} borderRadius="xl" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
        </Box>
      </Box>
    )
  }

  if (items.length === 0) {
    return (
      <Box minH="100vh" bg={pageBg}>
        <Box maxW="lg" mx="auto" px={4} py={12} display="flex" flexDirection="column" alignItems="center" textAlign="center" gap={4}>
          <Box w={14} h={14} borderRadius="full" bg={successBg} display="flex" alignItems="center" justifyContent="center">
            <svg style={{ height: '28px', width: '28px', color: '#059669' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </Box>
          <Box>
            <Text fontSize="xl" fontWeight="semibold" color={primaryColor}>All caught up</Text>
            <Text mt={1} fontSize="sm" color={secondaryColor}>
              No reviews due today. Keep learning to build your queue.
            </Text>
          </Box>
          <Link href="/">
            <Button variant="secondary" size="md">Back to home</Button>
          </Link>
        </Box>
      </Box>
    )
  }

  if (allDone) {
    return (
      <Box minH="100vh" bg={pageBg}>
        <Box maxW="lg" mx="auto" px={4} py={12} display="flex" flexDirection="column" alignItems="center" textAlign="center" gap={4}>
          <Box w={14} h={14} borderRadius="full" bg={successBg} display="flex" alignItems="center" justifyContent="center">
            <svg style={{ height: '28px', width: '28px', color: '#059669' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </Box>
          <Box>
            <Text fontSize="xl" fontWeight="semibold" color={primaryColor}>All caught up</Text>
            <Text mt={1} fontSize="sm" color={secondaryColor}>
              {completed} reviewed &middot; +{totalXPEarned} XP
            </Text>
          </Box>
          <Flex gap={3}>
            <Link href="/">
              <Button variant="secondary" size="md">Back to home</Button>
            </Link>
            <Link href="/learn">
              <Button variant="primary" size="md">Continue learning</Button>
            </Link>
          </Flex>
        </Box>
      </Box>
    )
  }

  const currentItem = items[currentIdx]

  return (
    <Box minH="100vh" bg={pageBg}>
      <Box maxW="lg" mx="auto" px={4} py={6} display="flex" flexDirection="column" gap={5}>
        {/* Header */}
        <Flex alignItems="center" justifyContent="space-between">
          <Box
            as={Link}
            href="/"
            fontSize="sm"
            color={backLinkColor}
            _hover={{ color: backLinkHoverColor }}
            transition="colors 0.15s"
          >
            &larr; Back
          </Box>
          <Text fontSize="base" fontWeight="semibold" color={primaryColor}>Daily Review</Text>
          <Box w="48px" />
        </Flex>

        {/* Progress */}
        <ReviewProgress completed={completed} total={items.length} />

        {/* Card area */}
        <AnimatePresence mode="wait">
          {showStrength && lastResult ? (
            <motion.div
              key="strength-panel"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <Box
                borderRadius="xl"
                border="1px solid"
                borderColor={panelBorder}
                bg={panelBg}
                p={5}
                display="flex"
                flexDirection="column"
                gap={4}
              >
                <Box textAlign="center" display="flex" flexDirection="column" gap={1}>
                  <Text fontSize="sm" fontWeight="semibold" color={primaryColor}>Memory strength</Text>
                  <Text fontSize="xs" color={secondaryColor}>{currentItem?.lessonTitle}</Text>
                </Box>
                <Flex justifyContent="center">
                  <StrengthIndicator strength={lastResult.newStrength} showLabel />
                </Flex>
                <Button
                  variant="primary"
                  size="md"
                  style={{ width: '100%' }}
                  onClick={handleNext}
                >
                  {currentIdx + 1 >= items.length ? 'Finish' : 'Next'}
                </Button>
              </Box>
            </motion.div>
          ) : (
            <motion.div
              key={'card-' + currentIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {currentItem && (
                <ReviewCard
                  item={currentItem}
                  onComplete={handleExerciseComplete}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </Box>
  )
}
