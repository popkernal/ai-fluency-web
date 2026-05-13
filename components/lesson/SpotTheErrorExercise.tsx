'use client'

import { useState } from 'react'
import { Box, Text, Flex, useColorModeValue } from '@chakra-ui/react'

interface SpotTheErrorData {
  statement?: string
  error?: string
  errorDescription?: string
  explanation?: string
  segments?: string[]
  errorIndex?: number
}

interface SpotTheErrorExerciseProps {
  prompt: string
  data: SpotTheErrorData
  onComplete: (score: number) => void
}

export function SpotTheErrorExercise({ prompt, data, onComplete }: SpotTheErrorExerciseProps) {
  const [revealed, setRevealed] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const promptColor = useColorModeValue('#374151', '#D1D5DB')
  const containerBg = useColorModeValue('#F8F9FA', '#1A1A1A')
  const containerBorder = useColorModeValue('#E5E7EB', '#2D2D2D')
  const sectionLabelColor = useColorModeValue('#6B7280', '#9CA3AF')
  const statementColor = useColorModeValue('#1A1A1A', '#F5F5F5')
  const segDefaultBorder = useColorModeValue('#E5E7EB', '#2D2D2D')
  const segDefaultBg = useColorModeValue('#FFFFFF', '#1A1A1A')
  const segDefaultText = useColorModeValue('#1A1A1A', '#F5F5F5')
  const errorCardBg = useColorModeValue('#FEF2F2', '#2D1A1A')
  const explanationBg = useColorModeValue('#F8F9FA', '#1A1A1A')
  const errorLabelColor = useColorModeValue('#DC2626', '#F87171')
  const segHoverBorder = useColorModeValue('#9CA3AF', '#6B7280')
  const correctResultBg = useColorModeValue('#F0FDF4', '#0A2918')
  const incorrectResultBg = useColorModeValue('#FEF2F2', '#2D1A1A')
  const showCorrectBg = useColorModeValue('#FEF2F2', '#2D1A1A')
  const showCorrectColor = useColorModeValue('#DC2626', '#F87171')
  const showWrongBorder = useColorModeValue('#D1D5DB', '#3D3D3D')
  const showWrongBg = useColorModeValue('#F3F4F6', '#252525')

  function handleSegmentClick(i: number) {
    if (submitted) return
    setSelected(i)
    setSubmitted(true)
    setTimeout(() => onComplete(i === data.errorIndex ? 100 : 0), 1200)
  }

  // Segments-based mode (legacy)
  if (data.segments && data.segments.length > 0 && data.errorIndex !== undefined) {
    const isCorrect = selected === data.errorIndex

    return (
      <Box display="flex" flexDirection="column" gap={5}>
        <Text fontSize="15px" color={promptColor} lineHeight="relaxed">{prompt}</Text>
        <Box borderRadius="xl" border="1px solid" borderColor={containerBorder} bg={containerBg} p={4}>
          <Text fontSize="12px" fontWeight="600" color={sectionLabelColor} textTransform="uppercase" letterSpacing="wide" mb={3}>
            Click the problematic part
          </Text>
          <Flex flexWrap="wrap" gap={1.5}>
            {data.segments.map((seg, i) => {
              const isSelected = selected === i
              const showCorrect = submitted && i === data.errorIndex
              const showWrong = submitted && isSelected && i !== data.errorIndex

              let borderColor = segDefaultBorder
              let bg = segDefaultBg
              let color = segDefaultText

              if (showCorrect) {
                borderColor = '#FCA5A5'
                bg = showCorrectBg
                color = showCorrectColor
              } else if (showWrong) {
                borderColor = showWrongBorder
                bg = showWrongBg
              }

              return (
                <Box
                  key={i}
                  as="button"
                  px={3}
                  py={1.5}
                  borderRadius="lg"
                  border="1px solid"
                  borderColor={borderColor}
                  bg={bg}
                  color={color}
                  fontSize="13px"
                  fontFamily="mono"
                  textAlign="left"
                  transition="all 0.15s"
                  cursor={submitted ? 'default' : 'pointer'}
                  opacity={showWrong ? 0.6 : 1}
                  _hover={!submitted ? { borderColor: segHoverBorder } : undefined}
                  style={{ fontFamily: 'var(--font-jetbrains-mono), Menlo, monospace' }}
                  onClick={() => handleSegmentClick(i)}
                  disabled={submitted}
                >
                  {seg}
                  {showCorrect && <Box as="span" ml={1} fontSize="11px" fontFamily="sans-serif" fontWeight="bold"> ← error</Box>}
                </Box>
              )
            })}
          </Flex>
        </Box>
        {submitted && (
          <Box
            borderRadius="xl"
            border="1px solid"
            px={4}
            py={3}
            borderColor={isCorrect ? '#6EE7B7' : '#FCA5A5'}
            bg={isCorrect ? correctResultBg : incorrectResultBg}
          >
            <Text fontSize="13px" fontWeight="600" mb={1} color={isCorrect ? '#059669' : '#DC2626'}>
              {isCorrect ? 'Correct!' : "Not quite — here's the issue:"}
            </Text>
            <Text fontSize="14px" color={promptColor} lineHeight="relaxed">{data.explanation}</Text>
          </Box>
        )}
      </Box>
    )
  }

  // Content format: reveal mode
  const statement = data.statement
  const errorText = data.error ?? data.errorDescription ?? ''
  const explanation = data.explanation ?? ''

  return (
    <Box display="flex" flexDirection="column" gap={5}>
      <Text fontSize="15px" color={promptColor} lineHeight="relaxed">{prompt}</Text>

      {statement && (
        <Box borderRadius="xl" border="1px solid" borderColor={containerBorder} bg={containerBg} p={4}>
          <Text fontSize="12px" fontWeight="600" color={sectionLabelColor} textTransform="uppercase" letterSpacing="wide" mb={2}>
            Statement
          </Text>
          <Text fontSize="14px" color={statementColor} lineHeight="relaxed" fontStyle="italic">
            &ldquo;{statement}&rdquo;
          </Text>
        </Box>
      )}

      {!revealed ? (
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
          onClick={() => { setRevealed(true); setTimeout(() => onComplete(100), 1200) }}
        >
          Reveal the error
        </Box>
      ) : (
        <Box display="flex" flexDirection="column" gap={3}>
          <Box borderRadius="xl" border="1px solid" borderColor="#FCA5A5" bg={errorCardBg} px={4} py={3}>
            <Text fontSize="12px" fontWeight="600" color={errorLabelColor} textTransform="uppercase" letterSpacing="wide" mb={1}>
              The error
            </Text>
            <Text fontSize="14px" color={promptColor} lineHeight="relaxed">{errorText}</Text>
          </Box>
          {explanation && (
            <Box borderRadius="xl" border="1px solid" borderColor={containerBorder} bg={explanationBg} px={4} py={3}>
              <Text fontSize="12px" fontWeight="600" color={sectionLabelColor} textTransform="uppercase" letterSpacing="wide" mb={1}>
                Why it matters
              </Text>
              <Text fontSize="14px" color={promptColor} lineHeight="relaxed">{explanation}</Text>
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}
