'use client'

import { useState, useRef } from 'react'
import { Box, Flex, Text, SimpleGrid, useColorModeValue } from '@chakra-ui/react'
import { UpgradeModal } from '@/components/lesson/UpgradeModal'

const FREE_DAILY_LIMIT = 3

const EXAMPLE_PROMPTS = [
  {
    label: 'Summarize a report',
    text: 'Summarize this quarterly report in 3 bullet points focused on decisions made, risks identified, and next steps. Keep each bullet under 25 words.',
  },
  {
    label: 'Draft a reply',
    text: 'Write a professional reply to this email politely declining the meeting request but suggesting an async alternative. Tone: friendly but direct.',
  },
  {
    label: 'Analyze data',
    text: 'Here is a CSV of monthly sales data. Identify the top 3 trends and suggest one action for each. Format as a short table.',
  },
  {
    label: 'Rewrite for clarity',
    text: 'Rewrite this paragraph to be clearer and more concise while preserving all the meaning. Highlight any ambiguous phrases you removed.',
  },
]

const TIPS = [
  { title: 'State your goal first', body: 'Lead with what you want, not background context. "Write a 3-bullet summary of X" beats a paragraph preamble.' },
  { title: 'Specify the format', body: 'Tell the model exactly how to structure the output — table, list, JSON, paragraph. Ambiguity leads to inconsistent results.' },
  { title: 'Provide relevant context', body: 'Include the audience, constraints, and tone. Pretend you\'re briefing a smart new hire on their first day.' },
  { title: 'Give an example', body: 'One concrete example of the output you want is worth ten sentences of description. Use "like this:" followed by a short sample.' },
]

interface PlaygroundResponse {
  response: string
  quality: { score: number; note: string }
  remaining: number | null
  plan: string
  promptTokens?: number
  responseTokens?: number
}

interface HistoryEntry {
  prompt: string
  response: string
  ts: Date
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function PlaygroundPage() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PlaygroundResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [rateLimited, setRateLimited] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [historyOpen, setHistoryOpen] = useState(false)
  const [tipsOpen, setTipsOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const primaryColor = useColorModeValue('#1A1A1A', '#F5F5F5')
  const secondaryColor = useColorModeValue('#6B7280', '#9CA3AF')
  const mutedColor = useColorModeValue('#9CA3AF', '#6B7280')
  const panelBg = useColorModeValue('#FFFFFF', '#1A1A1A')
  const panelBorder = useColorModeValue('#E5E7EB', '#2D2D2D')
  const inputBg = useColorModeValue('#FAFAFA', '#141414')
  const inputBorder = useColorModeValue('#E5E7EB', '#2D2D2D')
  const subLabelColor = useColorModeValue('#374151', '#D1D5DB')
  const hoverBg = useColorModeValue('#F8F9FA', '#1A1A1A')
  const skeletonBg = useColorModeValue('#E5E7EB', '#2D2D2D')
  const errorColor = useColorModeValue('#DC2626', '#F87171')
  const exampleHoverBorder = useColorModeValue('#D1D5DB', '#3D3D3D')

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setPrompt(e.target.value)
    const ta = e.target
    ta.style.height = 'auto'
    ta.style.height = `${ta.scrollHeight}px`
  }

  function loadExample(text: string) {
    setPrompt(text)
    setResult(null)
    setError(null)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
      textareaRef.current.focus()
    }
  }

  async function handleSend() {
    if (!prompt.trim() || loading || rateLimited) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/playground', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      if (res.status === 429) {
        setRateLimited(true)
        setLoading(false)
        return
      }

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Something went wrong.')
        setLoading(false)
        return
      }

      const data: PlaygroundResponse = await res.json()
      setResult(data)
      if (data.remaining !== null) setRemaining(data.remaining)

      setHistory(prev => [
        { prompt, response: data.response, ts: new Date() },
        ...prev.slice(0, 9),
      ])
    } catch {
      setError('Network error — please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleClear() {
    setPrompt('')
    setResult(null)
    setError(null)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.focus()
    }
  }

  return (
    <Box display="flex" flexDirection="column" gap={4}>
      {/* Header */}
      <Flex alignItems="flex-start" justifyContent="space-between" gap={4}>
        <Box>
          <Text fontSize="22px" fontWeight="bold" color={primaryColor} mb={1}>
            Prompt Playground
          </Text>
          <Text fontSize="14px" color={secondaryColor}>
            Experiment freely. Get automatic feedback on prompt quality.
          </Text>
        </Box>

        {remaining !== null && !rateLimited && (
          <Flex
            shrink={0}
            alignItems="center"
            gap="6px"
            bg="#FFFBEB"
            border="1px solid rgba(252,211,77,0.4)"
            borderRadius="lg"
            px={3}
            py="6px"
            mt={1}
          >
            <svg style={{ height: '14px', width: '14px', color: '#F59E0B' }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            <Text fontSize="12px" fontWeight="bold" color="#F59E0B" sx={{ fontVariantNumeric: "tabular-nums" }}>
              {remaining} of {FREE_DAILY_LIMIT} remaining today
            </Text>
          </Flex>
        )}
      </Flex>

      {/* Rate limit banner */}
      {rateLimited && (
        <Flex
          borderRadius="xl"
          border="1px solid rgba(252,211,77,0.4)"
          bg="#FFFBEB"
          px={4}
          py={3}
          alignItems="center"
          justifyContent="space-between"
          gap={3}
        >
          <Box>
            <Text fontSize="14px" fontWeight="semibold" color="#92400E">
              Daily limit reached
            </Text>
            <Text fontSize="13px" color="#78350F" mt="2px">
              Upgrade to Pro for unlimited playground prompts.
            </Text>
          </Box>
          <Box
            as="button"
            flexShrink={0}
            h="32px"
            px={3}
            borderRadius="lg"
            fontSize="13px"
            fontWeight="semibold"
            color="white"
            bg="#2563EB"
            _hover={{ bg: '#1D4ED8' }}
            transition="colors 0.15s"
            onClick={() => setUpgradeOpen(true)}
          >
            Upgrade
          </Box>
        </Flex>
      )}

      {/* Main layout */}
      <Flex flexDirection={{ base: 'column', lg: 'row' }} gap={4}>
        {/* Input panel */}
        <Box flex={1} display="flex" flexDirection="column" bg={panelBg} border="1px solid" borderColor={panelBorder} borderRadius="xl" p={4}>
          <Text fontSize="13px" fontWeight="semibold" color={subLabelColor} mb={2}>Your prompt</Text>
          <Box
            as="textarea"
            ref={textareaRef}
            value={prompt}
            onChange={handleInput}
            placeholder="Write your prompt here\u2026"
            disabled={rateLimited}
            rows={6}
            flex={1}
            w="full"
            minH="140px"
            resize="none"
            overflow="hidden"
            px={3}
            py="10px"
            borderRadius="lg"
            border="1px solid"
            fontSize="14px"
            lineHeight="relaxed"
            bg={inputBg}
            color={primaryColor}
            borderColor={inputBorder}
            _placeholder={{ color: mutedColor }}
            _focus={{ outline: 'none', borderColor: '#2563EB' }}
            _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
            transition="colors 0.15s"
          />
          <Flex alignItems="center" justifyContent="space-between" mt={3} pt={3} borderTop="1px solid" borderColor={panelBorder}>
            <Box
              as="button"
              onClick={handleClear}
              disabled={!prompt && !result}
              h="32px"
              px={3}
              fontSize="13px"
              fontWeight="medium"
              color={secondaryColor}
              _hover={{ color: primaryColor }}
              _disabled={{ opacity: 0.4, pointerEvents: 'none' }}
              transition="colors 0.15s"
            >
              Clear
            </Box>
            <Box
              as="button"
              onClick={handleSend}
              disabled={!prompt.trim() || loading || rateLimited}
              h="32px"
              px={4}
              borderRadius="lg"
              fontSize="13px"
              fontWeight="semibold"
              color="white"
              bg="#2563EB"
              _hover={{ bg: '#1D4ED8' }}
              _disabled={{ opacity: 0.4, pointerEvents: 'none' }}
              transition="colors 0.15s"
            >
              {loading ? (
                <Flex alignItems="center" gap="6px">
                  <svg style={{ animation: 'spin 1s linear infinite', height: '14px', width: '14px' }} fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Sending\u2026
                </Flex>
              ) : 'Send'}
            </Box>
          </Flex>
        </Box>

        {/* Response panel */}
        <Box flex={1} display="flex" flexDirection="column" bg={panelBg} border="1px solid" borderColor={panelBorder} borderRadius="xl" p={4}>
          <Flex alignItems="center" justifyContent="space-between" mb={2}>
            <Text fontSize="13px" fontWeight="semibold" color={subLabelColor}>Response</Text>
            {result?.promptTokens !== undefined && (
              <Text fontSize="11px" color={mutedColor} sx={{ fontVariantNumeric: "tabular-nums" }}>
                {result.promptTokens} in &middot; {result.responseTokens} out
              </Text>
            )}
          </Flex>
          <Box flex={1} minH="140px" borderRadius="lg" border="1px solid" borderColor={inputBorder} bg={inputBg} p={3}>
            {loading && (
              <Box display="flex" flexDirection="column" gap={2}>
                {[80, 100, 60, 90, 50].map((w, i) => (
                  <Box
                    key={i}
                    h="12px"
                    borderRadius="md"
                    bg={skeletonBg}
                    style={{ width: `${w}%`, animation: 'pulse 2s ease-in-out infinite' }}
                  />
                ))}
              </Box>
            )}
            {!loading && result && (
              <Text fontSize="14px" color={primaryColor} lineHeight="relaxed" whiteSpace="pre-wrap">
                {result.response}
              </Text>
            )}
            {!loading && !result && !error && (
              <Text fontSize="13px" color={mutedColor} fontStyle="italic">
                Response will appear here
              </Text>
            )}
            {!loading && error && (
              <Text fontSize="13px" color={errorColor}>{error}</Text>
            )}
          </Box>

          {/* Quality feedback */}
          <Box mt={3} pt={3} borderTop="1px solid" borderColor={panelBorder} minH="36px">
            {result ? (
              <Flex alignItems="flex-start" gap={2}>
                <Flex alignItems="center" gap="2px" mt="2px" flexShrink={0}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Text
                      key={i}
                      fontSize="11px"
                      color={i < Math.round(result.quality.score / 20) ? '#F59E0B' : skeletonBg}
                    >
                      &#9679;
                    </Text>
                  ))}
                </Flex>
                <Text fontSize="12px" color={secondaryColor} lineHeight="relaxed">
                  {result.quality.note}
                </Text>
              </Flex>
            ) : (
              <Text fontSize="12px" color={mutedColor}>
                Prompt quality feedback will appear here after submission.
              </Text>
            )}
          </Box>
        </Box>
      </Flex>

      {/* Tips panel */}
      <Box borderRadius="xl" border="1px solid" borderColor={panelBorder} bg={panelBg} overflow="hidden">
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
          transition="colors 0.15s"
          onClick={() => setTipsOpen(o => !o)}
        >
          <Flex alignItems="center" gap={2}>
            <svg style={{ height: '16px', width: '16px', color: secondaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <Text fontSize="13px" fontWeight="semibold" color={subLabelColor}>Prompt tips</Text>
          </Flex>
          <Box
            as="svg"
            style={{ height: '16px', width: '16px', color: mutedColor, transform: tipsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </Box>
        </Box>
        {tipsOpen && (
          <SimpleGrid columns={{ base: 1, sm: 2 }} borderTop="1px solid" borderColor={panelBorder}>
            {TIPS.map(tip => (
              <Box key={tip.title} bg={panelBg} px={4} py={3}>
                <Text fontSize="13px" fontWeight="semibold" color={subLabelColor} mb="2px">{tip.title}</Text>
                <Text fontSize="12px" color={secondaryColor} lineHeight="relaxed">{tip.body}</Text>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Box>

      {/* Example prompts */}
      <Box>
        <Text fontSize="13px" fontWeight="semibold" color={subLabelColor} mb={2}>Try an example</Text>
        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2}>
          {EXAMPLE_PROMPTS.map(ex => (
            <Box
              key={ex.label}
              as="button"
              textAlign="left"
              borderRadius="xl"
              border="1px solid"
              borderColor={panelBorder}
              bg={panelBg}
              _hover={{ borderColor: exampleHoverBorder }}
              _disabled={{ opacity: 0.4, pointerEvents: 'none' }}
              transition="colors 0.15s"
              p={3}
              disabled={rateLimited}
              onClick={() => loadExample(ex.text)}
            >
              <Text fontSize="13px" fontWeight="semibold" color={subLabelColor}>{ex.label}</Text>
              <Text fontSize="12px" color={secondaryColor} mt="2px" noOfLines={2}>{ex.text}</Text>
            </Box>
          ))}
        </SimpleGrid>
      </Box>

      {/* Prompt history */}
      {history.length > 0 && (
        <Box borderRadius="xl" border="1px solid" borderColor={panelBorder} bg={panelBg} overflow="hidden">
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
            transition="colors 0.15s"
            onClick={() => setHistoryOpen(o => !o)}
          >
            <Flex alignItems="center" gap={2}>
              <svg style={{ height: '16px', width: '16px', color: secondaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <Text fontSize="13px" fontWeight="semibold" color={subLabelColor}>
                Session history
              </Text>
              <Text fontSize="11px" color={mutedColor}>({history.length})</Text>
            </Flex>
            <Box
              as="svg"
              style={{ height: '16px', width: '16px', color: mutedColor, transform: historyOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </Box>
          </Box>
          {historyOpen && (
            <Box borderTop="1px solid" borderColor={panelBorder}>
              {history.map((entry, i) => (
                <Box key={i} px={4} py={3} borderBottom={i < history.length - 1 ? '1px solid' : 'none'} borderColor={panelBorder}>
                  <Flex alignItems="center" justifyContent="space-between" mb={1}>
                    <Text fontSize="12px" fontWeight="medium" color={subLabelColor} noOfLines={1} flex={1} mr={4}>
                      {entry.prompt}
                    </Text>
                    <Text flexShrink={0} fontSize="11px" color={mutedColor} sx={{ fontVariantNumeric: "tabular-nums" }}>
                      {formatTime(entry.ts)}
                    </Text>
                  </Flex>
                  <Text fontSize="12px" color={secondaryColor} noOfLines={2} lineHeight="relaxed">
                    {entry.response}
                  </Text>
                  <Box
                    as="button"
                    mt="6px"
                    fontSize="11px"
                    color="#2563EB"
                    _hover={{ textDecoration: 'underline' }}
                    onClick={() => loadExample(entry.prompt)}
                  >
                    Load prompt
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </Box>
  )
}
