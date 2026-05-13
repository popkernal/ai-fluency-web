'use client'

import { Box, Text, useColorModeValue } from '@chakra-ui/react'

interface StreakBadgeProps {
  streak: number
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  const bg = useColorModeValue('#FFF7ED', '#2D1A10')
  const borderColor = useColorModeValue('rgba(253, 186, 116, 0.4)', 'rgba(217, 119, 6, 0.3)')
  const numColor = useColorModeValue('#EA580C', '#FB923C')
  const labelColor = useColorModeValue('rgba(234, 88, 12, 0.8)', 'rgba(251, 146, 60, 0.7)')

  return (
    <Box
      display="flex"
      alignItems="center"
      gap={1.5}
      bg={bg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="lg"
      px={2.5}
      py={1}
    >
      <Text fontSize="sm" fontWeight="600" color={numColor} sx={{ fontVariantNumeric: "tabular-nums" }}>
        {streak}
      </Text>
      <Text fontSize="xs" color={labelColor}>day streak</Text>
    </Box>
  )
}
