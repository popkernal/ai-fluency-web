'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Box, Text, Flex, useColorModeValue } from '@chakra-ui/react'

interface AchievementToastProps {
  achievement: { id: string; title: string; description: string }
  onDismiss: () => void
}

export function AchievementToast({ achievement, onDismiss }: AchievementToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4500)
    return () => clearTimeout(timer)
  }, [onDismiss])

  const bg = useColorModeValue('#FFFBEB', '#2D2510')
  const borderColor = useColorModeValue('#FCD34D', '#B45309')
  const iconColor = useColorModeValue('#D97706', '#FCD34D')
  const titleColor = useColorModeValue('#1A1A1A', '#F5F5F5')
  const descColor = useColorModeValue('#6B7280', '#9CA3AF')
  const dismissColor = useColorModeValue('#9CA3AF', '#6B7280')
  const dismissHoverColor = useColorModeValue('#6B7280', '#D1D5DB')

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      style={{ pointerEvents: 'auto' }}
    >
      <Flex
        alignItems="flex-start"
        gap={3}
        borderRadius="xl"
        border="1px solid"
        borderColor={borderColor}
        px={4}
        py={3}
        shadow="md"
        bg={bg}
        role="status"
        aria-live="polite"
      >
        <Box flexShrink={0} mt={0.5}>
          <Box as="svg" w="20px" h="20px" color={iconColor} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </Box>
        </Box>
        <Box minW={0} flex={1}>
          <Text fontSize="11px" fontWeight="600" color={iconColor} textTransform="uppercase" letterSpacing="wide" mb={0.5}>
            Achievement
          </Text>
          <Text fontSize="sm" fontWeight="600" color={titleColor}>{achievement.title}</Text>
          <Text fontSize="xs" color={descColor} mt={0.5}>{achievement.description}</Text>
        </Box>
        <Box
          as="button"
          flexShrink={0}
          ml={1}
          color={dismissColor}
          _hover={{ color: dismissHoverColor }}
          transition="color 0.15s"
          aria-label="Dismiss"
          onClick={onDismiss}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Box>
      </Flex>
    </motion.div>
  )
}
