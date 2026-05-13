'use client'

import { useEffect } from 'react'
import { Box, Flex, Text } from '@chakra-ui/react'
import { Button } from '@/components/ui/Button'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <Flex minH="60vh" alignItems="center" justifyContent="center">
      <Box textAlign="center" display="flex" flexDirection="column" gap={4} maxW="sm" px={4}>
        <Text fontSize="4xl" fontWeight="bold" color="text.secondary">
          Something went wrong
        </Text>
        <Text fontSize="sm" color="text.secondary">
          An unexpected error occurred. Our team has been notified.
        </Text>
        {process.env.NODE_ENV !== 'production' && error.message && (
          <Box
            fontSize="xs"
            fontFamily="mono"
            color="red.500"
            bg="surface"
            border="1px solid"
            borderColor="border.default"
            borderRadius="md"
            p={2}
            textAlign="left"
            wordBreak="break-all"
          >
            {error.message}
          </Box>
        )}
        <Flex gap={3} justifyContent="center" pt={2}>
          <Button variant="secondary" onClick={() => window.location.assign('/')}>
            Go home
          </Button>
          <Button onClick={reset}>Try again</Button>
        </Flex>
      </Box>
    </Flex>
  )
}
