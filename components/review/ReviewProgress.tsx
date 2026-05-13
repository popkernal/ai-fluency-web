import { Box, Text, Flex, useColorModeValue } from '@chakra-ui/react'
import { ProgressBar } from '@/components/ui/ProgressBar'

interface ReviewProgressProps {
  completed: number
  total: number
}

export function ReviewProgress({ completed, total }: ReviewProgressProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
  const mutedColor = useColorModeValue('#6B7280', '#9CA3AF')
  const primaryColor = useColorModeValue('#1A1A1A', '#F5F5F5')

  return (
    <Box display="flex" flexDirection="column" gap={1.5}>
      <Flex alignItems="center" justifyContent="space-between">
        <Text fontSize="sm" color={mutedColor}>{completed} of {total} reviewed</Text>
        <Text fontSize="sm" fontWeight="500" color={primaryColor} sx={{ fontVariantNumeric: "tabular-nums" }}>
          {percentage}%
        </Text>
      </Flex>
      <ProgressBar value={percentage} color="#2563EB" size="sm" />
    </Box>
  )
}
