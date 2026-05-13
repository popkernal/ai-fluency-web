import { Box, Flex, SimpleGrid } from '@chakra-ui/react'
import { Skeleton } from '@/components/ui/Skeleton'

export default function ProfileLoading() {
  return (
    <Box maxW="2xl" mx="auto" display="flex" flexDirection="column" gap={6}>
      {/* Hero */}
      <Box bg="surface" border="1px solid" borderColor="border.default" borderRadius="xl" p={6}>
        <Flex alignItems="flex-start" gap={4}>
          <Skeleton variant="circle" height="64px" width="64px" />
          <Box flex={1} display="flex" flexDirection="column" gap={2}>
            <Skeleton height="24px" width="160px" />
            <Skeleton height="16px" width="96px" />
            <Skeleton height="16px" width="256px" />
          </Box>
        </Flex>
      </Box>

      {/* Stats row */}
      <SimpleGrid columns={3} spacing={3}>
        {[1, 2, 3].map(i => (
          <Box
            key={i}
            bg="surface"
            border="1px solid"
            borderColor="border.default"
            borderRadius="xl"
            p={4}
            display="flex"
            flexDirection="column"
            gap={2}
            alignItems="center"
          >
            <Skeleton height="32px" width="48px" />
            <Skeleton height="12px" width="64px" />
          </Box>
        ))}
      </SimpleGrid>

      {/* My Tracks */}
      <Box bg="surface" border="1px solid" borderColor="border.default" borderRadius="xl" p={5} display="flex" flexDirection="column" gap={4}>
        <Skeleton height="20px" width="96px" />
        {[1, 2, 3].map(i => (
          <Box key={i} display="flex" flexDirection="column" gap="6px">
            <Flex justifyContent="space-between">
              <Skeleton height="16px" width="160px" />
              <Skeleton height="16px" width="40px" />
            </Flex>
            <Skeleton height="8px" />
          </Box>
        ))}
      </Box>

      {/* Achievements grid */}
      <Box bg="surface" border="1px solid" borderColor="border.default" borderRadius="xl" p={5} display="flex" flexDirection="column" gap={4}>
        <Skeleton height="20px" width="112px" />
        <SimpleGrid columns={3} spacing={3}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Box key={i} display="flex" flexDirection="column" gap={2} alignItems="center">
              <Skeleton variant="circle" height="48px" width="48px" />
              <Skeleton height="12px" width="64px" />
            </Box>
          ))}
        </SimpleGrid>
      </Box>

      {/* Settings */}
      <Box bg="surface" border="1px solid" borderColor="border.default" borderRadius="xl" p={5} display="flex" flexDirection="column" gap={4}>
        <Skeleton height="20px" width="80px" />
        {[1, 2, 3].map(i => (
          <Flex key={i} alignItems="center" justifyContent="space-between">
            <Skeleton height="16px" width="128px" />
            <Skeleton height="24px" width="40px" />
          </Flex>
        ))}
      </Box>
    </Box>
  )
}
