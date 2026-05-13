import { Box, Text, useColorModeValue } from '@chakra-ui/react'

interface ExampleBlockProps {
  bad: string
  good: string
  explanation: string
}

function PromptCard({ label, text, variant }: { label: string; text: string; variant: 'bad' | 'good' }) {
  const isBad = variant === 'bad'
  const headerBg = useColorModeValue(
    isBad ? '#FEF2F2' : '#F0FDF4',
    isBad ? '#2D1A1A' : '#0F2918'
  )
  const headerBorder = useColorModeValue(
    isBad ? '#FECACA' : '#A7F3D0',
    isBad ? '#5B2020' : '#1A4A2E'
  )
  const labelColor = useColorModeValue(
    isBad ? '#DC2626' : '#059669',
    isBad ? '#F87171' : '#34D399'
  )
  const preBg = useColorModeValue(
    isBad ? '#FFF5F5' : '#F6FEF8',
    isBad ? '#1E1010' : '#0D1F13'
  )
  const codeColor = useColorModeValue('#1A1A1A', '#E5E7EB')
  const borderLeftColor = isBad ? '#FCA5A5' : '#6EE7B7'

  return (
    <Box borderRadius="lg" overflow="hidden" borderLeft="4px solid" borderLeftColor={borderLeftColor}>
      <Box
        px={4}
        py={2}
        display="flex"
        alignItems="center"
        gap={2}
        borderBottom="1px solid"
        borderColor={headerBorder}
        bg={headerBg}
      >
        <Text fontSize="11px" fontWeight="600" textTransform="uppercase" letterSpacing="wide" color={labelColor}>
          {label}
        </Text>
      </Box>
      <Box
        as="pre"
        px={4}
        py={3}
        fontSize="13px"
        lineHeight="relaxed"
        overflowX="auto"
        whiteSpace="pre-wrap"
        wordBreak="break-word"
        bg={preBg}
      >
        <Box
          as="code"
          color={codeColor}
          style={{ fontFamily: 'var(--font-jetbrains-mono), Menlo, monospace' }}
        >
          {text}
        </Box>
      </Box>
    </Box>
  )
}

export function ExampleBlock({ bad, good, explanation }: ExampleBlockProps) {
  const cardBg = useColorModeValue('#F8F9FA', '#1A1A1A')
  const borderColor = useColorModeValue('#E5E7EB', '#2D2D2D')
  const labelColor = useColorModeValue('#6B7280', '#9CA3AF')
  const textColor = useColorModeValue('#374151', '#D1D5DB')

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <PromptCard label="Less effective" text={bad} variant="bad" />
      <PromptCard label="More effective" text={good} variant="good" />
      <Box borderRadius="lg" bg={cardBg} border="1px solid" borderColor={borderColor} px={4} py={3}>
        <Text fontSize="12px" fontWeight="600" color={labelColor} textTransform="uppercase" letterSpacing="wide" mb={1.5}>
          Why this works
        </Text>
        <Text fontSize="14px" color={textColor} lineHeight="relaxed">
          {explanation}
        </Text>
      </Box>
    </Box>
  )
}
