'use client'

import { Box, Text, Flex, useColorModeValue } from '@chakra-ui/react'
import type { ExerciseType } from '@/types'
import { MultipleChoiceExercise } from '@/components/lesson/MultipleChoiceExercise'
import { PromptExercise } from '@/components/lesson/PromptExercise'

export interface ReviewCardItem {
  scheduleId: string
  lessonId: string
  lessonTitle: string
  exerciseIndex: number
  exerciseType: ExerciseType
  prompt: string
  data: Record<string, unknown>
  strength: number
  timesReviewed: number
}

interface ReviewCardProps {
  item: ReviewCardItem
  onComplete: (score: number) => void
}

export function ReviewCard({ item, onComplete }: ReviewCardProps) {
  const bg = useColorModeValue('#FFFFFF', '#1A1A1A')
  const borderColor = useColorModeValue('#E5E7EB', '#2D2D2D')
  const labelBg = useColorModeValue('#F3F4F6', '#2D2D2D')
  const labelColor = useColorModeValue('#6B7280', '#9CA3AF')
  const titleColor = useColorModeValue('#374151', '#D1D5DB')
  const reviewCountColor = useColorModeValue('#9CA3AF', '#6B7280')

  return (
    <Box
      borderRadius="xl"
      border="1px solid"
      borderColor={borderColor}
      bg={bg}
      p={5}
      display="flex"
      flexDirection="column"
      gap={4}
    >
      <Flex alignItems="flex-start" justifyContent="space-between" gap={3}>
        <Box minW={0}>
          <Box
            as="span"
            display="inline-block"
            fontSize="11px"
            fontWeight="600"
            color={labelColor}
            textTransform="uppercase"
            letterSpacing="wide"
            bg={labelBg}
            borderRadius="sm"
            px={2}
            py={0.5}
            mb={1.5}
          >
            Review
          </Box>
          <Text fontSize="sm" color={titleColor} noOfLines={1}>{item.lessonTitle}</Text>
        </Box>
        {item.timesReviewed > 0 && (
          <Text flexShrink={0} fontSize="xs" color={reviewCountColor} sx={{ fontVariantNumeric: "tabular-nums" }} whiteSpace="nowrap">
            Reviewed {item.timesReviewed}&times;
          </Text>
        )}
      </Flex>

      {item.exerciseType === 'multiple_choice' ? (
        <MultipleChoiceExercise
          prompt={item.prompt}
          data={item.data as { choices: string[]; correctIndex: number; explanation: string }}
          onComplete={onComplete}
        />
      ) : (
        <PromptExercise
          lessonId={item.lessonId}
          exerciseIndex={item.exerciseIndex}
          prompt={item.prompt}
          data={item.data as { scenario?: string; hints?: string[]; rubric: string[] }}
          onComplete={onComplete}
        />
      )}
    </Box>
  )
}
