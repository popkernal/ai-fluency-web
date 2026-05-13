import { Box, Flex, SimpleGrid } from '@chakra-ui/react'
import { Skeleton } from '@/components/ui/Skeleton'

export default function AdminOrgLoading() {
  return (
    <Box display="flex" flexDirection="column" gap={6} maxW="6xl">
      <Skeleton height="32px" width="160px" />

      {/* Stats row */}
      <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3}>
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
          >
            <Skeleton height="12px" width="96px" />
            <Skeleton height="32px" width="64px" />
          </Box>
        ))}
      </SimpleGrid>

      {/* Orgs table */}
      <Box bg="surface" border="1px solid" borderColor="border.default" borderRadius="xl" overflow="hidden">
        <Flex alignItems="center" gap={4} px={4} py={3} borderBottom="1px solid" borderColor="border.default">
          <Skeleton height="12px" width="160px" />
          <Skeleton height="12px" width="80px" />
          <Skeleton height="12px" width="80px" />
          <Skeleton height="12px" width="96px" />
          <Skeleton height="12px" width="80px" />
        </Flex>
        {[1, 2, 3, 4, 5].map(i => (
          <Flex
            key={i}
            alignItems="center"
            gap={4}
            px={4}
            py="14px"
            borderBottom={i < 5 ? '1px solid' : 'none'}
            borderColor="border.default"
          >
            <Skeleton height="16px" width="160px" />
            <Skeleton height="16px" width="64px" />
            <Skeleton height="20px" width="64px" />
            <Skeleton height="16px" width="96px" />
            <Skeleton height="24px" width="64px" />
          </Flex>
        ))}
      </Box>
    </Box>
  )
}
