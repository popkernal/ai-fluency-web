'use client'

import { useState, useRef } from 'react'
import { Box, Text, Flex, useColorModeValue } from '@chakra-ui/react'

interface OrderTheStepsData {
  steps: string[]
  correctOrder: number[]
  explanation?: string
}

interface OrderTheStepsExerciseProps {
  prompt: string
  data: OrderTheStepsData
  onComplete: (score: number) => void
}

export function OrderTheStepsExercise({ prompt, data, onComplete }: OrderTheStepsExerciseProps) {
  const [order, setOrder] = useState<number[]>(() => data.steps.map((_, i) => i))
  const [submitted, setSubmitted] = useState(false)
  const [dragging, setDragging] = useState<number | null>(null)
  const dragOver = useRef<number | null>(null)

  const promptColor = useColorModeValue('#374151', '#D1D5DB')
  const defaultBg = useColorModeValue('#FFFFFF', '#1A1A1A')
  const defaultBorder = useColorModeValue('#E5E7EB', '#2D2D2D')
  const defaultText = useColorModeValue('#1A1A1A', '#F5F5F5')
  const handleColor = useColorModeValue('#D1D5DB', '#4B5563')
  const numBg = useColorModeValue('#F3F4F6', '#252525')
  const numColor = useColorModeValue('#6B7280', '#9CA3AF')
  const expBg = useColorModeValue('#F8F9FA', '#1A1A1A')
  const expBorder = useColorModeValue('#E5E7EB', '#2D2D2D')
  const expColor = useColorModeValue('#374151', '#D1D5DB')
  const mobileColor = useColorModeValue('#9CA3AF', '#6B7280')

  function moveItem(from: number, to: number) {
    if (from === to) return
    const next = [...order]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    setOrder(next)
  }

  function handleSubmit() {
    if (submitted) return
    setSubmitted(true)
    const correct = order.filter((stepIdx, pos) => stepIdx === data.correctOrder[pos]).length
    const score = Math.round((correct / order.length) * 100)
    setTimeout(() => onComplete(score), 1400)
  }

  return (
    <Box display="flex" flexDirection="column" gap={4}>
      <Text fontSize="15px" color={promptColor} lineHeight="relaxed">{prompt}</Text>

      <Box display="flex" flexDirection="column" gap={2}>
        {order.map((stepIdx, pos) => {
          const isCorrectPosition = submitted && stepIdx === data.correctOrder[pos]
          const isWrong = submitted && stepIdx !== data.correctOrder[pos]

          let borderColor = defaultBorder
          let bg = defaultBg
          if (isCorrectPosition) { borderColor = '#6EE7B7'; bg = useColorModeValue('#F0FDF4', '#0A2918') }
          else if (isWrong) { borderColor = '#FCA5A5'; bg = useColorModeValue('#FEF2F2', '#2D1A1A') }

          return (
            <Flex
              key={stepIdx}
              alignItems="center"
              gap={3}
              borderRadius="xl"
              border="2px solid"
              borderColor={borderColor}
              px={4}
              py={3}
              bg={bg}
              transition="all 0.15s"
              userSelect="none"
              cursor={submitted ? 'default' : 'grab'}
              opacity={!submitted && dragging === pos ? 0.4 : 1}
              draggable={!submitted}
              onDragStart={() => setDragging(pos)}
              onDragEnter={() => { dragOver.current = pos }}
              onDragOver={e => { e.preventDefault(); dragOver.current = pos }}
              onDragEnd={() => {
                if (dragging !== null && dragOver.current !== null) moveItem(dragging, dragOver.current)
                setDragging(null); dragOver.current = null
              }}
            >
              {!submitted && (
                <Box as="svg" w="16px" h="16px" color={handleColor} flexShrink={0} fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                  <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
                </Box>
              )}

              <Flex
                flexShrink={0}
                w="28px"
                h="28px"
                borderRadius="full"
                alignItems="center"
                justifyContent="center"
                fontSize="12px"
                fontWeight="bold"
                bg={isCorrectPosition ? '#059669' : isWrong ? '#DC2626' : numBg}
                color={isCorrectPosition || isWrong ? 'white' : numColor}
              >
                {pos + 1}
              </Flex>

              <Text flex={1} fontSize="14px" color={defaultText} lineHeight="snug">
                {data.steps[stepIdx]}
              </Text>

              {!submitted && (
                <Box display={{ base: 'flex', md: 'none' }} flexDirection="column" gap={0.5} flexShrink={0}>
                  <Box
                    as="button"
                    p={1}
                    borderRadius="sm"
                    color={mobileColor}
                    _hover={{ color: defaultText }}
                    opacity={pos === 0 ? 0.3 : 1}
                    pointerEvents={pos === 0 ? 'none' : 'auto'}
                    onClick={() => { const n=[...order]; [n[pos-1],n[pos]]=[n[pos],n[pos-1]]; setOrder(n) }}
                    aria-label="Move up"
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </Box>
                  <Box
                    as="button"
                    p={1}
                    borderRadius="sm"
                    color={mobileColor}
                    _hover={{ color: defaultText }}
                    opacity={pos === order.length - 1 ? 0.3 : 1}
                    pointerEvents={pos === order.length - 1 ? 'none' : 'auto'}
                    onClick={() => { const n=[...order]; [n[pos],n[pos+1]]=[n[pos+1],n[pos]]; setOrder(n) }}
                    aria-label="Move down"
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Box>
                </Box>
              )}
            </Flex>
          )
        })}
      </Box>

      {submitted && data.explanation && (
        <Box borderRadius="xl" border="1px solid" borderColor={expBorder} bg={expBg} px={4} py={3}>
          <Text fontSize="14px" color={expColor} lineHeight="relaxed">{data.explanation}</Text>
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
          transition="background 0.15s"
          onClick={handleSubmit}
        >
          Check order
        </Box>
      )}
    </Box>
  )
}
