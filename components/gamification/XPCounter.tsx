'use client'

import { Box, Text, Flex, useColorModeValue } from '@chakra-ui/react'
import { getLevelForXP, getXPToNextLevel } from '@/lib/xpEngine'
import { ProgressBar } from '@/components/ui/ProgressBar'

interface XPCounterProps {
  totalXP: number
  compact?: boolean
}

export function XPCounter({ totalXP, compact = false }: XPCounterProps) {
  const level = getLevelForXP(totalXP)
  const { current, needed, percentage } = getXPToNextLevel(totalXP)

  const mutedColor = useColorModeValue('#6B7280', '#9CA3AF')
  const primaryColor = useColorModeValue('#1A1A1A', '#F5F5F5')

  if (compact) {
    return (
      <Text fontSize="sm" color={mutedColor}>
        Level {level} · {totalXP.toLocaleString()} XP
      </Text>
    )
  }

  return (
    <Box display="flex" flexDirection="column" gap={1.5}>
      <Flex alignItems="center" justifyContent="space-between">
        <Text fontSize="sm" fontWeight="600" color={primaryColor}>Level {level}</Text>
        <Text fontSize="xs" color={mutedColor} sx={{ fontVariantNumeric: "tabular-nums" }}>
          {current.toLocaleString()} / {needed.toLocaleString()} XP
        </Text>
      </Flex>
      <ProgressBar value={percentage} color="#2563EB" size="sm" />
    </Box>
  )
}
