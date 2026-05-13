import { Box, Flex } from '@chakra-ui/react'
import { Skeleton } from '@/components/ui/Skeleton'

export default function LessonLoading() {
  return (
    <Box maxW="2xl" mx="auto" display="flex" flexDirection="column" gap={6}>
      {/* Progress bar */}
      <Flex alignItems="center" gap={3}>
        <Skeleton height="16px" width="16px" />
        <Box flex={1}><Skeleton height="8px" /></Box>
        <Skeleton height="16px" width="64px" />
      </Flex>

      {/* Section header */}
      <Box display="flex" flexDirection="column" gap={2}>
        <Skeleton height="24px" width="96px" />
        <Skeleton height="28px" width="75%" />
      </Box>

      {/* Content block */}
      <Box
        bg="surface"
        border="1px solid"
        borderColor="border.default"
        borderRadius="xl"
        p={5}
        display="flex"
        flexDirection="column"
        gap={3}
      >
        <Skeleton height="16px" />
        <Skeleton height="16px" />
        <Skeleton height="16px" width="83%" />
        <Skeleton height="16px" />
        <Skeleton height="16px" width="80%" />
      </Box>

      {/* Example block */}
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
        <Skeleton height="20px" width="128px" />
        <Box display="flex" flexDirection="column" gap={2}>
          <Skeleton height="16px" />
          <Skeleton height="16px" />
          <Skeleton height="16px" width="75%" />
        </Box>
        <Box display="flex" flexDirection="column" gap={2} pt={2}>
          <Skeleton height="16px" />
          <Skeleton height="16px" />
          <Skeleton height="16px" width="83%" />
        </Box>
      </Box>

      {/* Continue button */}
      <Flex justifyContent="flex-end">
        <Skeleton height="40px" width="112px" />
      </Flex>
    </Box>
  )
}
