'use client'

import { useState, useRef } from 'react'
import { Box, Text, Flex, useColorModeValue } from '@chakra-ui/react'

interface FillInBlankDataTemplate {
  template: string
  blanks: Array<{ hint: string; acceptable: string[] }>
  explanation?: string
}

interface FillInBlankDataSimple {
  blanks: string[]
  hint?: string
  explanation?: string
}

type FillInBlankData = FillInBlankDataTemplate | FillInBlankDataSimple

interface FillInBlankExerciseProps {
  prompt: string
  data: FillInBlankData
  onComplete: (score: number) => void
}

function levenshtein(a: string, b: string): number {
  const m = a.length; const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i-1]===b[j-1] ? dp[i-1][j-1] : 1+Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1])
    }
  }
  return dp[m][n]
}

function isClose(answer: string, correct: string): boolean {
  return levenshtein(answer.trim().toLowerCase(), correct.toLowerCase()) <= 2
}

function parseTemplate(template: string): Array<{ type: 'text'; text: string } | { type: 'blank'; index: number }> {
  const parts = template.split(/({{blank_\d+}})/g)
  return parts.map(part => {
    const match = part.match(/{{blank_(\d+)}}/)
    if (match) return { type: 'blank' as const, index: parseInt(match[1]) }
    return { type: 'text' as const, text: part }
  })
}

function isTemplateFormat(data: FillInBlankData): data is FillInBlankDataTemplate {
  return 'template' in data && typeof (data as FillInBlankDataTemplate).template === 'string'
}

export function FillInBlankExercise({ prompt, data, onComplete }: FillInBlankExerciseProps) {
  const blankCount = data.blanks.length
  const [values, setValues] = useState<string[]>(Array(blankCount).fill(''))
  const [focusedBlank, setFocusedBlank] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState<boolean[]>([])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const promptColor = useColorModeValue('#374151', '#D1D5DB')
  const containerBg = useColorModeValue('#F8F9FA', '#1A1A1A')
  const containerBorder = useColorModeValue('#E5E7EB', '#2D2D2D')
  const inputBg = useColorModeValue('#FFFFFF', '#1A1A1A')
  const defaultInputBorder = useColorModeValue('#E5E7EB', '#2D2D2D')
  const textColor = useColorModeValue('#1A1A1A', '#F5F5F5')
  const hintBg = useColorModeValue('#FFFFFF', '#1A1A1A')
  const hintColor = useColorModeValue('#6B7280', '#9CA3AF')
  const expBg = useColorModeValue('#F8F9FA', '#1A1A1A')
  const labelColor = useColorModeValue('#6B7280', '#9CA3AF')

  function handleSubmit() {
    if (submitted) return
    let res: boolean[]
    if (isTemplateFormat(data)) {
      res = values.map((v, i) => {
        const blankDef = (data as FillInBlankDataTemplate).blanks[i]
        return blankDef ? blankDef.acceptable.some(a => isClose(v, a)) : false
      })
    } else {
      res = values.map((v, i) => isClose(v, (data as FillInBlankDataSimple).blanks[i]))
    }
    setResults(res)
    setSubmitted(true)
    const score = Math.round((res.filter(Boolean).length / res.length) * 100)
    setTimeout(() => onComplete(score), 1400)
  }

  const allFilled = values.every(v => v.trim().length > 0)

  if (isTemplateFormat(data)) {
    const segments = parseTemplate(data.template)
    return (
      <Box display="flex" flexDirection="column" gap={5}>
        <Text fontSize="15px" color={promptColor} lineHeight="relaxed">{prompt}</Text>
        <Box borderRadius="xl" border="1px solid" borderColor={containerBorder} bg={containerBg} p={4}>
          <Box
            fontSize="14px"
            lineHeight={2.2}
            color={textColor}
            display="flex"
            flexWrap="wrap"
            alignItems="baseline"
            gap="4px"
            style={{ fontFamily: 'var(--font-jetbrains-mono), Menlo, monospace' }}
          >
            {segments.map((seg, i) => {
              if (seg.type === 'text') return <Box as="span" key={i}>{seg.text}</Box>
              const idx = (seg as { type: 'blank'; index: number }).index
              const isFocused = focusedBlank === idx
              const isCorrect = submitted && results[idx]
              const isWrong = submitted && !results[idx]
              const blankDef = data.blanks[idx] as { hint: string; acceptable: string[] }

              const borderColor = isCorrect ? '#6EE7B7' : isWrong ? '#FCA5A5' : (isFocused && !submitted ? '#2563EB' : defaultInputBorder)
              const bg = isCorrect ? '#F0FDF4' : isWrong ? '#FEF2F2' : inputBg
              const color = isCorrect ? '#059669' : isWrong ? '#DC2626' : textColor

              return (
                <Box key={i} position="relative" display="inline-block">
                  <Box
                    as="input"
                    ref={(el: HTMLInputElement | null) => { inputRefs.current[idx] = el }}
                    value={values[idx]}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      if (submitted) return
                      const next = [...values]; next[idx] = e.target.value; setValues(next)
                    }}
                    onFocus={() => setFocusedBlank(idx)}
                    onBlur={() => setFocusedBlank(null)}
                    disabled={submitted}
                    placeholder={`blank ${idx + 1}`}
                    h="32px"
                    px={2}
                    borderRadius="lg"
                    border="2px solid"
                    borderColor={borderColor}
                    bg={bg}
                    color={color}
                    fontSize="13px"
                    minW="80px"
                    maxW="200px"
                    outline="none"
                    transition="border-color 0.15s"
                    style={{
                      fontFamily: 'var(--font-jetbrains-mono), Menlo, monospace',
                      width: `${Math.max(80, (values[idx]?.length ?? 0) * 9 + 24)}px`
                    }}
                  />
                  {isFocused && !submitted && blankDef?.hint && (
                    <Box
                      position="absolute"
                      bottom="-28px"
                      left={0}
                      fontSize="11px"
                      color={hintColor}
                      whiteSpace="nowrap"
                      bg={hintBg}
                      border="1px solid"
                      borderColor={containerBorder}
                      borderRadius="sm"
                      px={2}
                      py={0.5}
                      zIndex={10}
                    >
                      Hint: {blankDef.hint}
                    </Box>
                  )}
                  {isWrong && blankDef?.acceptable?.[0] && (
                    <Box
                      position="absolute"
                      bottom="-24px"
                      left={0}
                      fontSize="11px"
                      color="#059669"
                      whiteSpace="nowrap"
                    >
                      → {blankDef.acceptable[0]}
                    </Box>
                  )}
                </Box>
              )
            })}
          </Box>
        </Box>
        {submitted && data.explanation && (
          <Box borderRadius="xl" border="1px solid" borderColor={containerBorder} bg={expBg} px={4} py={3}>
            <Text fontSize="14px" color={promptColor} lineHeight="relaxed">{data.explanation}</Text>
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
            opacity={!allFilled ? 0.4 : 1}
            pointerEvents={!allFilled ? 'none' : 'auto'}
            transition="all 0.15s"
            onClick={handleSubmit}
          >
            Check answers
          </Box>
        )}
      </Box>
    )
  }

  const simpleData = data as FillInBlankDataSimple
  return (
    <Box display="flex" flexDirection="column" gap={5}>
      <Text fontSize="15px" color={promptColor} lineHeight="relaxed">{prompt}</Text>
      {simpleData.hint && (
        <Text fontSize="13px" color={labelColor} fontStyle="italic">Hint: {simpleData.hint}</Text>
      )}
      <Box display="flex" flexDirection="column" gap={3}>
        {simpleData.blanks.map((correct, idx) => {
          const isFocused = focusedBlank === idx
          const isCorrect = submitted && results[idx]
          const isWrong = submitted && !results[idx]
          const borderColor = isCorrect ? '#6EE7B7' : isWrong ? '#FCA5A5' : (isFocused && !submitted ? '#2563EB' : defaultInputBorder)
          const bg = isCorrect ? '#F0FDF4' : isWrong ? '#FEF2F2' : inputBg

          return (
            <Flex key={idx} alignItems="center" gap={3}>
              <Text fontSize="13px" fontWeight="500" color={labelColor} w="64px" flexShrink={0}>
                Blank {idx + 1}
              </Text>
              <Box position="relative" flex={1}>
                <Box
                  as="input"
                  ref={(el: HTMLInputElement | null) => { inputRefs.current[idx] = el }}
                  value={values[idx]}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (submitted) return
                    const next = [...values]; next[idx] = e.target.value; setValues(next)
                  }}
                  onFocus={() => setFocusedBlank(idx)}
                  onBlur={() => setFocusedBlank(null)}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' && allFilled && !submitted) handleSubmit() }}
                  disabled={submitted}
                  placeholder="Type your answer…"
                  w="full"
                  h="40px"
                  px={3}
                  borderRadius="xl"
                  border="2px solid"
                  borderColor={borderColor}
                  bg={bg}
                  color={textColor}
                  fontSize="14px"
                  outline="none"
                  transition="all 0.15s"
                />
                {submitted && (
                  <Box
                    position="absolute"
                    right={3}
                    top="50%"
                    transform="translateY(-50%)"
                    fontSize="12px"
                    fontWeight="500"
                    color={isCorrect ? '#059669' : '#DC2626'}
                  >
                    {isCorrect ? '✓' : `→ ${correct}`}
                  </Box>
                )}
              </Box>
            </Flex>
          )
        })}
      </Box>
      {submitted && data.explanation && (
        <Box borderRadius="xl" border="1px solid" borderColor={containerBorder} bg={expBg} px={4} py={3}>
          <Text fontSize="14px" color={promptColor} lineHeight="relaxed">{data.explanation}</Text>
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
          opacity={!allFilled ? 0.4 : 1}
          pointerEvents={!allFilled ? 'none' : 'auto'}
          transition="all 0.15s"
          onClick={handleSubmit}
        >
          Check answers
        </Box>
      )}
    </Box>
  )
}
