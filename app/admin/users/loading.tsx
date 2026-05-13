import { Box, Flex, SimpleGrid } from '@chakra-ui/react'
import { Skeleton } from '@/components/ui/Skeleton'

export default function AdminUsersLoading() {
  return (
    <Box display="flex" flexDirection="column" gap={6} maxW="6xl">
      <Flex alignItems="center" justifyContent="space-between">
        <Skeleton height="32px" width="112px" />
        <Skeleton height="36px" width="128px" />
      </Flex>

      {/* Filters row */}
      <Flex gap={3}>
        <Skeleton height="36px" width="192px" />
        <Skeleton height="36px" width="128px" />
        <Skeleton height="36px" width="128px" />
      </Flex>

      {/* Table */}
      <Box bg="surface" border="1px solid" borderColor="border.default" borderRadius="xl" overflow="hidden">
        {/* Header row */}
        <Flex alignItems="center" gap={4} px={4} py={3} borderBottom="1px solid" borderColor="border.default">
          <Skeleton height="12px" width="112px" />
          <Skeleton height="12px" width="176px" />
          <Skeleton height="12px" width="80px" />
          <Skeleton height="12px" width="80px" />
          <Skeleton height="12px" width="80px" />
          <Skeleton height="12px" width="56px" />
        </Flex>
        {/* Data rows */}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
          <Flex
            key={i}
            alignItems="center"
            gap={4}
            px={4}
            py="14px"
            borderBottom={i < 10 ? '1px solid' : 'none'}
            borderColor="border.default"
          >
            <Flex alignItems="center" gap={2} w="112px">
              <Skeleton variant="circle" height="28px" width="28px" />
              <Skeleton height="12px" width="64px" />
            </Flex>
            <Skeleton height="12px" width="176px" />
            <Skeleton height="20px" width="64px" />
            <Skeleton height="12px" width="64px" />
            <Skeleton height="12px" width="80px" />
            <Skeleton height="24px" width="48px" />
          </Flex>
        ))}
      </Box>

      {/* Pagination */}
      <Flex alignItems="center" justifyContent="space-between">
        <Skeleton height="16px" width="128px" />
        <Flex gap={2}>
          <Skeleton height="32px" width="80px" />
          <Skeleton height="32px" width="80px" />
        </Flex>
      </Flex>
    </Box>
  )
}
