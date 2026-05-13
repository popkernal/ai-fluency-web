import { Box, Text, Flex, useColorModeValue } from '@chakra-ui/react'

interface StrengthIndicatorProps {
  strength: number   // 0–100
  showLabel?: boolean
}

function getStrengthLabel(strength: number) {
  if (strength >= 70) return 'Strong'
  if (strength >= 40) return 'Moderate'
  return 'Weak'
}

function getStrengthColor(strength: number) {
  if (strength >= 70) return '#059669'
  if (strength >= 40) return '#D97706'
  return '#DC2626'
}

function getSegmentFilled(strength: number, segment: 1 | 2 | 3): boolean {
  if (segment === 1) return strength >= 33
  if (segment === 2) return strength >= 66
  return strength >= 90
}

export function StrengthIndicator({ strength, showLabel = true }: StrengthIndicatorProps) {
  const color = getStrengthColor(strength)
  const label = getStrengthLabel(strength)
  const emptyColor = useColorModeValue('#E5E7EB', '#2D2D2D')
  const labelColor = useColorModeValue('#6B7280', '#9CA3AF')

  return (
    <Flex alignItems="center" gap={2}>
      <Flex gap={1} aria-label={`Memory strength: ${label}`}>
        {([1, 2, 3] as const).map(seg => (
          <Box
            key={seg}
            h="6px"
            w="24px"
            borderRadius="full"
            transition="background 0.3s"
            bg={getSegmentFilled(strength, seg) ? color : emptyColor}
          />
        ))}
      </Flex>
      {showLabel && (
        <Text fontSize="xs" color={labelColor}>{label}</Text>
      )}
    </Flex>
  )
}
