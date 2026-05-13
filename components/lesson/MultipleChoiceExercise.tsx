'use client'

import { useState } from 'react'
import { Box, Text, Flex, useColorModeValue } from '@chakra-ui/react'

interface MultipleChoiceData {
  choices: string[]
  correctIndex: number
  explanation: string
}

interface MultipleChoiceExerciseProps {
  prompt: string
  data: MultipleChoiceData
  onComplete: (score: number) => void
}

export function MultipleChoiceExercise({ prompt, data, onComplete }: MultipleChoiceExerciseProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const promptColor = useColorModeValue('#374151', '#D1D5DB')
  const defaultBorder = useColorModeValue('#E5E7EB', '#2D2D2D')
  const defaultBg = useColorModeValue('#FFFFFF', '#1A1A1A')
  const defaultText = useColorModeValue('#1A1A1A', '#F5F5F5')
  const labelBorder = useColorModeValue('#D1D5DB', '#4B5563')
  const labelText = useColorModeValue('#6B7280', '#9CA3AF')
  const hoverBorder = useColorModeValue('#9CA3AF', '#6B7280')
  const expBg = useColorModeValue('#F8F9FA', '#1A1A1A')
  const expBorder = useColorModeValue('#E5E7EB', '#2D2D2D')
  const expLabelColor = useColorModeValue('#6B7280', '#9CA3AF')
  const expTextColor = useColorModeValue('#374151', '#D1D5DB')

  function handleSelect(i: number) {
    if (submitted) return
    setSelected(i)
  }

  function handleSubmit() {
    if (selected === null || submitted) return
    setSubmitted(true)
    const isCorrect = selected === data.correctIndex
    setTimeout(() => onComplete(isCorrect ? 100 : 0), 1200)
  }

  return (
    <Box display="flex" flexDirection="column" gap={4}>
      <Text fontSize="15px" color={promptColor} lineHeight="relaxed">{prompt}</Text>

      <Box display="flex" flexDirection="column" gap={2}>
        {data.choices.map((choice, i) => {
          const isSelected = selected === i
          const isCorrect = i === data.correctIndex

          let borderColor = defaultBorder
          let bg = defaultBg
          const letterBg = isSelected ? (submitted ? (isCorrect ? '#059669' : '#DC2626') : '#2563EB') : 'transparent'
          const letterBorderColor = isSelected ? letterBg : labelBorder
          const letterColor = isSelected ? 'white' : labelText

          if (submitted && isCorrect) {
            borderColor = '#6EE7B7'
            bg = useColorModeValue('#F0FDF4', '#0A2918')
          } else if (submitted && isSelected && !isCorrect) {
            borderColor = '#FCA5A5'
            bg = useColorModeValue('#FEF2F2', '#2D1A1A')
          } else if (!submitted && isSelected) {
            borderColor = '#2563EB'
            bg = useColorModeValue('#EFF6FF', '#0F1E38')
          }

          return (
            <Box
              key={i}
              as="button"
              w="full"
              textAlign="left"
              borderRadius="xl"
              border="2px solid"
              borderColor={borderColor}
              px={4}
              py={3}
              bg={bg}
              transition="all 0.15s"
              cursor={submitted ? 'default' : 'pointer'}
              _hover={!submitted ? { borderColor: hoverBorder } : undefined}
              onClick={() => handleSelect(i)}
              disabled={submitted}
            >
              <Flex alignItems="flex-start" gap={3}>
                <Flex
                  flexShrink={0}
                  w="24px"
                  h="24px"
                  borderRadius="full"
                  border="2px solid"
                  borderColor={letterBorderColor}
                  bg={letterBg}
                  alignItems="center"
                  justifyContent="center"
                  fontSize="12px"
                  fontWeight="bold"
                  color={letterColor}
                  mt={0.5}
                >
                  {submitted && isCorrect ? '✓' : submitted && isSelected && !isCorrect ? '✗' : String.fromCharCode(65 + i)}
                </Flex>
                <Text fontSize="14px" lineHeight="snug" color={defaultText}>{choice}</Text>
              </Flex>
            </Box>
          )
        })}
      </Box>

      {submitted && (
        <Box borderRadius="xl" border="1px solid" borderColor={expBorder} bg={expBg} px={4} py={3}>
          <Text fontSize="12px" fontWeight="600" color={expLabelColor} textTransform="uppercase" letterSpacing="wide" mb={1}>
            Explanation
          </Text>
          <Text fontSize="14px" color={expTextColor} lineHeight="relaxed">
            {data.explanation}
          </Text>
        </Box>
      )}

      {!submitted && (
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
          opacity={selected === null ? 0.4 : 1}
          pointerEvents={selected === null ? 'none' : 'auto'}
          transition="all 0.15s"
          onClick={handleSubmit}
        >
          Check answer
        </Box>
      )}
    </Box>
  )
}
