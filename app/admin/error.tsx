'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Box, Flex, Text } from '@chakra-ui/react'
import { Button } from '@/components/ui/Button'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AdminError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <Box maxW="6xl" mt={8}>
      <Box
        bg="surface"
        border="1px solid"
        borderColor="border.default"
        borderRadius="xl"
        p={8}
        textAlign="center"
        display="flex"
        flexDirection="column"
        gap={4}
        alignItems="center"
      >
        <Text fontSize="2xl" fontWeight="semibold" color="text.primary">Admin dashboard error</Text>
        <Text fontSize="sm" color="text.secondary">
          There was a problem loading admin data. This may be a temporary issue.
        </Text>
        {process.env.NODE_ENV !== 'production' && error.message && (
          <Box
            fontSize="xs"
            fontFamily="mono"
            color="red.500"
            bg="bg"
            border="1px solid"
            borderColor="border.default"
            borderRadius="md"
            p={2}
            textAlign="left"
            wordBreak="break-all"
            maxW="lg"
            w="full"
          >
            {error.message}
          </Box>
        )}
        <Flex gap={3} justifyContent="center" pt={2}>
          <Box
            as={Link}
            href="/"
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            h="40px"
            px={4}
            borderRadius="xl"
            fontSize="sm"
            fontWeight="semibold"
            border="1px solid"
            borderColor="border.default"
            bg="surface"
            color="text.primary"
            _hover={{ bg: '#F9FAFB', _dark: { bg: '#252525' } }}
            transition="colors 0.15s"
          >
            Go home
          </Box>
          <Button onClick={reset}>Try again</Button>
        </Flex>
      </Box>
    </Box>
  )
}
