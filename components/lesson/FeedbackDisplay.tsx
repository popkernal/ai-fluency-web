'use client'

import { useState } from 'react'
import { Box, Text, Flex, useColorModeValue } from '@chakra-ui/react'
import type { GradeResult } from '@/types'

interface FeedbackDisplayProps {
  result: GradeResult
  onContinue: () => void
}

function ScoreDots({ score }: { score: number }) {
  const filled = Math.round((score / 100) * 5)
  const emptyColor = useColorModeValue('#E5E7EB', '#2D2D2D')
  const scoreTextColor = useColorModeValue('#6B7280', '#9CA3AF')
  return (
    <Flex alignItems="center" gap={1.5}>
      {Array.from({ length: 5 }, (_, i) => (
        <Text key={i} fontSize="18px" lineHeight={1} color={i < filled ? '#F59E0B' : emptyColor}>●</Text>
      ))}
      <Text ml={1} fontSize="13px" color={scoreTextColor}>{score}/100</Text>
    </Flex>
  )
}

export function FeedbackDisplay({ result, onContinue }: FeedbackDisplayProps) {
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const cardBg = useColorModeValue('#F8F9FA', '#1A1A1A')
  const borderColor = useColorModeValue('#E5E7EB', '#2D2D2D')
  const textColor = useColorModeValue('#374151', '#D1D5DB')
  const mutedColor = useColorModeValue('#6B7280', '#9CA3AF')
  const dimColor = useColorModeValue('#D1D5DB', '#4B5563')
  const hoverBg = useColorModeValue('#F3F4F6', '#252525')
  const suggestionHeaderColor = useColorModeValue('#374151', '#D1D5DB')
  const correctBadgeColor = useColorModeValue('#059669', '#059669')
  const incorrectBadgeColor = useColorModeValue('#D97706', '#D97706')
  const correctBadgeBg = useColorModeValue('#F0FDF4', '#0A2918')
  const incorrectBadgeBg = useColorModeValue('#FFFBEB', '#2A2210')

  const badgeColor = result.isCorrect ? correctBadgeColor : incorrectBadgeColor
  const badgeBg = result.isCorrect ? correctBadgeBg : incorrectBadgeBg

  return (
    <Box display="flex" flexDirection="column" gap={4} animation="slideUp 0.3s ease">
      {/* Score row */}
      <Flex alignItems="center" justifyContent="space-between">
        <ScoreDots score={result.score} />
        <Text
          fontSize="13px"
          fontWeight="600"
          px={2.5}
          py={0.5}
          borderRadius="full"
          color={badgeColor}
          bg={badgeBg}
        >
          {result.isCorrect ? 'Great work' : 'Keep going'}
        </Text>
      </Flex>

      {/* Feedback card */}
      <Box borderRadius="xl" border="1px solid" borderColor={borderColor} bg={cardBg} p={4}>
        <Text fontSize="14px" color={textColor} lineHeight="relaxed">
          {result.feedback}
        </Text>
      </Box>

      {/* Suggestions — collapsible */}
      {result.suggestions && result.suggestions.length > 0 && (
        <Box borderRadius="xl" border="1px solid" borderColor={borderColor} overflow="hidden">
          <Box
            as="button"
            w="full"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            px={4}
            py={3}
            textAlign="left"
            _hover={{ bg: hoverBg }}
            transition="background 0.15s"
            onClick={() => setSuggestionsOpen(o => !o)}
          >
            <Text fontSize="13px" fontWeight="600" color={suggestionHeaderColor}>
              Ideas to improve
            </Text>
            <Box
              as="svg"
              w="16px"
              h="16px"
              color={mutedColor}
              transform={suggestionsOpen ? 'rotate(180deg)' : undefined}
              transition="transform 0.2s"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </Box>
          </Box>
          {suggestionsOpen && (
            <Box as="ul" px={4} pb={3} display="flex" flexDirection="column" gap={2}>
              {result.suggestions.map((s, i) => (
                <Flex key={i} gap={2} fontSize="13px" color={mutedColor}>
                  <Text mt={0.5} color={dimColor}>•</Text>
                  <Text>{s}</Text>
                </Flex>
              ))}
            </Box>
          )}
        </Box>
      )}

      <Box
        as="button"
        w="full"
        h="44px"
        borderRadius="xl"
        fontSize="15px"
        fontWeight="600"
        color="white"
        bg="#2563EB"
        _hover={{ bg: '#1D4ED8' }}
        transition="background 0.15s"
        onClick={onContinue}
      >
        Continue →
      </Box>
    </Box>
  )
}
