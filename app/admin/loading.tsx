import { Box, SimpleGrid } from '@chakra-ui/react'
import { Skeleton } from '@/components/ui/Skeleton'

export default function AdminLoading() {
  return (
    <Box display="flex" flexDirection="column" gap={6} maxW="6xl">
      <Skeleton height="32px" width="128px" />

      {/* KPI cards grid */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={3}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
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
            <Skeleton height="32px" width="80px" />
            <Skeleton height="12px" width="64px" />
          </Box>
        ))}
      </SimpleGrid>

      {/* Engagement chart */}
      <Box bg="surface" border="1px solid" borderColor="border.default" borderRadius="xl" p={5} display="flex" flexDirection="column" gap={4}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Skeleton height="20px" width="160px" />
          <Skeleton height="32px" width="112px" />
        </Box>
        <Skeleton height="192px" />
      </Box>

      {/* PostHog embeds grid */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
        {[1, 2].map(i => (
          <Box
            key={i}
            bg="surface"
            border="1px solid"
            borderColor="border.default"
            borderRadius="xl"
            p={5}
            display="flex"
            flexDirection="column"
            gap={3}
          >
            <Skeleton height="20px" width="144px" />
            <Skeleton height="128px" />
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  )
}
