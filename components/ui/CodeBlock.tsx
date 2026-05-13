import { Box, Text, useColorModeValue } from '@chakra-ui/react'
import { HTMLAttributes } from 'react'

interface CodeBlockProps {
  code: string
  language?: string
  label?: string
}

export function CodeBlock({ code, language, label }: CodeBlockProps) {
  const headerBg = useColorModeValue('#F3F4F6', '#252525')
  const headerBorder = useColorModeValue('#E5E7EB', '#2D2D2D')
  const preBg = useColorModeValue('#F8F9FA', '#1E1E1E')
  const codeColor = useColorModeValue('#1A1A1A', '#E5E7EB')
  const labelColor = useColorModeValue('#6B7280', '#9CA3AF')
  const langColor = useColorModeValue('#9CA3AF', '#6B7280')

  return (
    <Box borderRadius="lg" overflow="hidden">
      {(language || label) && (
        <Box
          px={4}
          py={1.5}
          bg={headerBg}
          borderBottom="1px solid"
          borderColor={headerBorder}
          display="flex"
          alignItems="center"
          gap={2}
        >
          {label && (
            <Text fontSize="xs" color={labelColor}>{label}</Text>
          )}
          {language && (
            <Text ml="auto" fontSize="xs" fontFamily="mono" color={langColor}>
              {language}
            </Text>
          )}
        </Box>
      )}
      <Box
        as="pre"
        bg={preBg}
        px={4}
        py={3}
        overflowX="auto"
        fontSize="sm"
        lineHeight="relaxed"
      >
        <Box
          as="code"
          color={codeColor}
          whiteSpace="pre-wrap"
          wordBreak="break-word"
          fontFamily="mono"
          style={{ fontFamily: 'var(--font-jetbrains-mono), Menlo, monospace' }}
        >
          {code}
        </Box>
      </Box>
    </Box>
  )
}

// Inline code variant
export function InlineCode({ children }: { children: React.ReactNode }) {
  const bg = useColorModeValue('#F3F4F6', '#252525')
  const color = useColorModeValue('#1A1A1A', '#E5E7EB')

  return (
    <Box
      as="code"
      px={1.5}
      py={0.5}
      borderRadius="sm"
      fontSize="sm"
      bg={bg}
      color={color}
      fontFamily="mono"
      style={{ fontFamily: 'var(--font-jetbrains-mono), Menlo, monospace' }}
    >
      {children}
    </Box>
  )
}
