import { Box, Flex } from '@chakra-ui/react'
import { Skeleton } from '@/components/ui/Skeleton'

export default function ReviewLoading() {
  return (
    <Box maxW="2xl" mx="auto" display="flex" flexDirection="column" gap={6}>
      {/* Header */}
      <Flex alignItems="center" justifyContent="space-between">
        <Skeleton height="16px" width="80px" />
        <Skeleton height="24px" width="128px" />
        <Box w="80px" />
      </Flex>

      {/* Progress bar */}
      <Box display="flex" flexDirection="column" gap="6px">
        <Flex justifyContent="space-between">
          <Skeleton height="12px" width="96px" />
          <Skeleton height="12px" width="48px" />
        </Flex>
        <Skeleton height="8px" />
      </Box>

      {/* Review card */}
      <Box
        bg="surface"
        border="1px solid"
        borderColor="border.default"
        borderRadius="xl"
        p={5}
        display="flex"
        flexDirection="column"
        gap={4}
      >
        {/* Card header */}
        <Flex alignItems="center" justifyContent="space-between">
          <Flex alignItems="center" gap={2}>
            <Skeleton height="20px" width="64px" />
            <Skeleton height="16px" width="160px" />
          </Flex>
          <Skeleton height="16px" width="80px" />
        </Flex>

        {/* Exercise prompt */}
        <Box display="flex" flexDirection="column" gap={2}>
          <Skeleton height="16px" />
          <Skeleton height="16px" width="83%" />
          <Skeleton height="16px" width="80%" />
        </Box>

        {/* Answer options */}
        <Box display="flex" flexDirection="column" gap={2} pt={2}>
          {[1, 2, 3, 4].map(i => (
            <Box
              key={i}
              border="1px solid"
              borderColor="border.default"
              borderRadius="lg"
              p={3}
            >
              <Skeleton height="16px" width="75%" />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}
