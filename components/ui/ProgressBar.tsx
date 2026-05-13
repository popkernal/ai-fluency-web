import { Box, Text, useColorModeValue } from '@chakra-ui/react'

interface ProgressBarProps {
  value: number         // 0–100
  max?: number
  color?: string        // hex color
  size?: 'xs' | 'sm' | 'md'
  showLabel?: boolean
}

const sizeMap = { xs: '4px', sm: '6px', md: '8px' }

export function ProgressBar({
  value,
  max = 100,
  color = '#2563EB',
  size = 'sm',
  showLabel = false,
}: ProgressBarProps) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100)
  const trackBg = useColorModeValue('#E5E7EB', '#2D2D2D')
  const labelColor = useColorModeValue('#6B7280', '#9CA3AF')

  return (
    <Box w="full">
      <Box
        w="full"
        borderRadius="full"
        bg={trackBg}
        overflow="hidden"
        h={sizeMap[size]}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <Box
          h="full"
          borderRadius="full"
          bg={color}
          transition="width 0.3s"
          style={{ width: `${pct}%` }}
        />
      </Box>
      {showLabel && (
        <Text mt={1} fontSize="xs" color={labelColor}>
          {Math.round(pct)}%
        </Text>
      )}
    </Box>
  )
}
