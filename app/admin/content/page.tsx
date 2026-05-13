import { Box, Flex, Text } from '@chakra-ui/react'
import { getLessonAnalytics } from '@/lib/adminEngine'
import { ContentTableClient } from './ContentTableClient'

export const metadata = { title: 'Admin — Content Analytics' }
export const dynamic = 'force-dynamic'

export default async function AdminContentPage() {
  const rows = await getLessonAnalytics()

  return (
    <Box display="flex" flexDirection="column" gap={4} maxW="6xl">
      <Box>
        <Text fontSize="22px" fontWeight="bold" color="text.primary">Content Analytics</Text>
        <Text fontSize="sm" color="text.secondary" mt={1}>
          Lesson performance — completion rates, average scores, and drop-off indicators.
        </Text>
      </Box>

      <Flex alignItems="center" gap={3} fontSize="xs" color="text.secondary">
        <Flex alignItems="center" gap={1}>
          <Box w="8px" h="8px" borderRadius="full" bg="#F87171" display="inline-block" />
          Flagged: completion &lt; 60% or avg score &lt; 50%
        </Flex>
        <Text>{rows.length} lessons tracked</Text>
      </Flex>

      <ContentTableClient rows={rows} />
    </Box>
  )
}
