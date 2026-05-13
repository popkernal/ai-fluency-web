import Link from 'next/link'
import { Box, Flex, Text } from '@chakra-ui/react'

export const metadata = {
  title: 'Page Not Found — AI Fluency',
}

export default function NotFound() {
  return (
    <Flex minH="70vh" alignItems="center" justifyContent="center">
      <Box textAlign="center" display="flex" flexDirection="column" gap={5} maxW="sm" px={4}>
        <Text fontSize="7xl" fontWeight="bold" color="text.secondary" userSelect="none">
          404
        </Text>
        <Box display="flex" flexDirection="column" gap={2}>
          <Text fontSize="2xl" fontWeight="semibold" color="text.primary">Page not found</Text>
          <Text fontSize="sm" color="text.secondary">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </Text>
        </Box>
        <Box
          as={Link}
          href="/"
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          h="40px"
          px={5}
          borderRadius="xl"
          fontSize="sm"
          fontWeight="semibold"
          color="white"
          bg="#0EA5E9"
          _hover={{ bg: '#0284C7' }}
          transition="colors 0.15s"
        >
          Back to home
        </Box>
      </Box>
    </Flex>
  )
}
