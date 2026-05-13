'use client'

import { useState, useRef } from 'react'
import { Box, Text, Flex, Spinner, useColorModeValue } from '@chakra-ui/react'
import { FeedbackDisplay } from './FeedbackDisplay'
import { gradeExercise } from '@/lib/grader'
import { useToast } from '@/components/ui/Toast'
import type { GradeResult } from '@/types'

interface PromptExerciseData {
  scenario?: string
  hints?: string[]
  rubric: string[]
}

interface PromptExerciseProps {
  lessonId: string
  exerciseIndex?: number
  prompt: string
  data: PromptExerciseData
  onComplete: (score: number) => void
}

export function PromptExercise({ lessonId, exerciseIndex, prompt, data, onComplete }: PromptExerciseProps) {
  const [value, setValue] = useState('')
  const [hintsShown, setHintsShown] = useState(0)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GradeResult | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  const textColor = useColorModeValue('#374151', '#D1D5DB')
  const cardBg = useColorModeValue('#F8F9FA', '#1A1A1A')
  const cardBorder = useColorModeValue('#E5E7EB', '#2D2D2D')
  const labelColor = useColorModeValue('#6B7280', '#9CA3AF')
  const inputBg = useColorModeValue('#FFFFFF', '#1A1A1A')
  const inputText = useColorModeValue('#1A1A1A', '#F5F5F5')
  const hintBorder = useColorModeValue('#E5E7EB', '#2D2D2D')
  const hintText = useColorModeValue('#9CA3AF', '#6B7280')
  const hintLinkColor = useColorModeValue('#6B7280', '#9CA3AF')
  const counterColorShort = useColorModeValue('#D1D5DB', '#4B5563')
  const counterColorLong = useColorModeValue('#9CA3AF', '#6B7280')
  const counterColor = value.length < 20 ? counterColorShort : counterColorLong

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value)
    const ta = e.target
    ta.style.height = 'auto'
    ta.style.height = `${ta.scrollHeight}px`
  }

  async function handleSubmit() {
    if (loading || value.trim().length < 20) return
    setLoading(true)
    try {
      const grade = await gradeExercise('prompt_write', value, { rubric: data.rubric }, lessonId, exerciseIndex)
      setResult(grade)
      if (grade.isCorrect) toast('+15 XP', { variant: 'success', duration: 3000 })
    } catch {
      setResult({ isCorrect: false, score: 0, feedback: 'Could not grade — please try again.' })
    } finally {
      setLoading(false)
    }
  }

  if (result) return <FeedbackDisplay result={result} onContinue={() => onComplete(result.score)} />

  return (
    <Box display="flex" flexDirection="column" gap={4}>
      {data.scenario && (
        <Box borderRadius="xl" bg={cardBg} border="1px solid" borderColor={cardBorder} px={4} py={3}>
          <Text fontSize="12px" fontWeight="600" color={labelColor} textTransform="uppercase" letterSpacing="wide" mb={1}>
            Scenario
          </Text>
          <Text fontSize="14px" color={textColor} lineHeight="relaxed">{data.scenario}</Text>
        </Box>
      )}

      <Text fontSize="15px" color={textColor} lineHeight="relaxed">{prompt}</Text>

      <Box position="relative">
        <Box
          as="textarea"
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          placeholder="Write your prompt here…"
          rows={4}
          w="full"
          px={4}
          py={3}
          borderRadius="xl"
          border="2px solid"
          borderColor={cardBorder}
          bg={inputBg}
          color={inputText}
          fontSize="14px"
          lineHeight="relaxed"
          resize="none"
          overflow="hidden"
          outline="none"
          _focus={{ borderColor: '#2563EB' }}
          transition="border-color 0.15s"
          style={{ minHeight: '104px' }}
        />
        <Text position="absolute" bottom={3} right={3} fontSize="11px" sx={{ fontVariantNumeric: "tabular-nums" }} color={counterColor}>
          {value.length} / 20 min
        </Text>
      </Box>

      {data.hints && data.hints.length > 0 && (
        <Box display="flex" flexDirection="column" gap={1.5}>
          {data.hints.slice(0, hintsShown).map((hint, i) => (
            <Text key={i} fontSize="13px" color={hintText} fontStyle="italic" pl={3} borderLeft="2px solid" borderColor={hintBorder}>
              Hint {i + 1}: {hint}
            </Text>
          ))}
          {hintsShown < data.hints.length && (
            <Box
              as="button"
              fontSize="13px"
              color={hintLinkColor}
              _hover={{ color: inputText, textDecoration: 'underline' }}
              transition="color 0.15s"
              textAlign="left"
              onClick={() => setHintsShown(h => h + 1)}
            >
              Show hint {hintsShown + 1} of {data.hints.length}
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
        opacity={value.trim().length < 20 || loading ? 0.4 : 1}
        pointerEvents={value.trim().length < 20 || loading ? 'none' : 'auto'}
        transition="all 0.15s"
        onClick={handleSubmit}
        display="flex"
        alignItems="center"
        justifyContent="center"
        gap={2}
      >
        {loading ? <><Spinner size="sm" /> Grading…</> : 'Submit'}
      </Box>
    </Box>
  )
}
