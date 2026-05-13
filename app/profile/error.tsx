'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Box, Flex, Text } from '@chakra-ui/react'
import { Button } from '@/components/ui/Button'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ProfileError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <Box maxW="2xl" mx="auto" mt={16} textAlign="center" display="flex" flexDirection="column" gap={4} px={4}>
      <Text fontSize="2xl" fontWeight="semibold" color="text.primary">Could not load profile</Text>
      <Text fontSize="sm" color="text.secondary">
        There was a problem loading your profile. Please try again.
      </Text>
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
  )
}
