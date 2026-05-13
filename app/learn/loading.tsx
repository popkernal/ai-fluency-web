import { Box, Flex, SimpleGrid } from '@chakra-ui/react'
import { Skeleton } from '@/components/ui/Skeleton'

export default function LearnLoading() {
  return (
    <Box display="flex" flexDirection="column" gap={8}>
      {/* Header */}
      <Box display="flex" flexDirection="column" gap={2}>
        <Skeleton height="32px" width="192px" />
        <Skeleton height="16px" width="288px" />
      </Box>

      {/* Three stream sections */}
      {[1, 2, 3].map(stream => (
        <Box key={stream} display="flex" flexDirection="column" gap={4}>
          {/* Stream header */}
          <Flex alignItems="center" gap={3}>
            <Skeleton height="24px" width="128px" />
            <Skeleton height="16px" width="96px" />
          </Flex>

          {/* Track cards row */}
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={3}>
            {[1, 2, 3].map(track => (
              <Box
                key={track}
                bg="surface"
                border="1px solid"
                borderColor="border.default"
                borderRadius="xl"
                p={4}
                display="flex"
                flexDirection="column"
                gap={3}
              >
                <Flex alignItems="center" gap={2}>
                  <Skeleton variant="circle" height="32px" width="32px" />
                  <Skeleton height="20px" width="128px" />
                </Flex>
                <Skeleton height="12px" />
                <Skeleton height="12px" width="80%" />
                <Skeleton height="8px" />
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      ))}
    </Box>
  )
}
