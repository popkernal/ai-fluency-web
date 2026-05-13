import { Skeleton as ChakraSkeleton, Box } from '@chakra-ui/react'

interface SkeletonProps {
  className?: string
  variant?: 'line' | 'circle' | 'rect'
  width?: string | number
  height?: string | number
}

export function Skeleton({ variant = 'rect', width, height, className }: SkeletonProps) {
  return (
    <ChakraSkeleton
      borderRadius={variant === 'circle' ? 'full' : variant === 'line' ? 'md' : 'lg'}
      w={width ?? (variant === 'line' ? 'full' : undefined)}
      h={height ?? (variant === 'line' ? '16px' : undefined)}
      className={className}
    />
  )
}

// Preset composites
export function SkeletonCard() {
  return (
    <Box
      bg="surface"
      border="1px solid"
      borderColor="border.default"
      borderRadius="xl"
      p={4}
      display="flex"
      flexDirection="column"
      gap={3}
    >
      <ChakraSkeleton h="20px" w="60%" borderRadius="lg" />
      <ChakraSkeleton h="16px" w="full" borderRadius="lg" />
      <ChakraSkeleton h="16px" w="80%" borderRadius="lg" />
      <ChakraSkeleton h="32px" w="96px" borderRadius="lg" mt={2} />
    </Box>
  )
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {Array.from({ length: lines }).map((_, i) => (
        <ChakraSkeleton
          key={i}
          h="16px"
          w={i === lines - 1 ? '60%' : 'full'}
          borderRadius="md"
        />
      ))}
    </Box>
  )
}
