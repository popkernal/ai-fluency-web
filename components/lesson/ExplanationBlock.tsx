'use client'

import { Box, Text, Code, useColorModeValue } from '@chakra-ui/react'

interface ExplanationBlockProps {
  content: string
  trackColor?: string
}

function renderInline(text: string, boldColor: string, codeBg: string, codeColor: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <Box as="strong" key={i} fontWeight="600" color={boldColor}>{part.slice(2, -2)}</Box>
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <Box
          as="code"
          key={i}
          px={1.5}
          py={0.5}
          borderRadius="sm"
          fontSize="13px"
          bg={codeBg}
          color={codeColor}
          style={{ fontFamily: 'var(--font-jetbrains-mono), Menlo, monospace' }}
        >
          {part.slice(1, -1)}
        </Box>
      )
    }
    return part
  })
}

export function ExplanationBlock({ content, trackColor }: ExplanationBlockProps) {
  const textColor = useColorModeValue('#374151', '#D1D5DB')
  const blockquoteBg = useColorModeValue('#F8F9FA', '#1A1A1A')
  const boldColor = useColorModeValue('#1A1A1A', '#F5F5F5')
  const codeBg = useColorModeValue('#F3F4F6', '#252525')
  const codeColor = useColorModeValue('#1A1A1A', '#E5E7EB')

  const nodes = content.split('\n\n').map((para, i) => {
    if (para.startsWith('> ')) {
      const inner = para.slice(2)
      return (
        <Box
          key={i}
          my={4}
          pl={4}
          py={3}
          pr={3}
          borderRadius="0 8px 8px 0"
          borderLeft="4px solid"
          borderLeftColor={trackColor ?? '#2563EB'}
          bg={blockquoteBg}
        >
          <Text fontSize="15px" color={textColor} lineHeight="relaxed">
            {renderInline(inner, boldColor, codeBg, codeColor)}
          </Text>
        </Box>
      )
    }
    return (
      <Text key={i} fontSize="15px" color={textColor} lineHeight="relaxed">
        {renderInline(para, boldColor, codeBg, codeColor)}
      </Text>
    )
  })

  return (
    <Box display="flex" flexDirection="column" gap={4}>
      {nodes}
    </Box>
  )
}
