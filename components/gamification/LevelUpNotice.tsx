'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Box, Text, Flex, useColorModeValue } from '@chakra-ui/react'

interface LevelUpNoticeProps {
  newLevel: number
  onDismiss: () => void
}

export function LevelUpNotice({ newLevel, onDismiss }: LevelUpNoticeProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  const bg = useColorModeValue('#FFF7ED', '#2D1A10')
  const borderColor = useColorModeValue('#FDBA74', '#D97706')
  const titleColor = useColorModeValue('#1A1A1A', '#F5F5F5')
  const descColor = useColorModeValue('#6B7280', '#9CA3AF')
  const dismissColor = useColorModeValue('#9CA3AF', '#6B7280')
  const dismissHoverColor = useColorModeValue('#6B7280', '#D1D5DB')

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      style={{ pointerEvents: 'auto' }}
    >
      <Flex
        alignItems="center"
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
        <Flex
          flexShrink={0}
          w="36px"
          h="36px"
          borderRadius="full"
          bg="#EA580C"
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize="sm" fontWeight="bold" color="white" sx={{ fontVariantNumeric: "tabular-nums" }}>
            {newLevel}
          </Text>
        </Flex>
        <Box minW={0}>
          <Text fontSize="sm" fontWeight="600" color={titleColor}>Level {newLevel} reached</Text>
          <Text fontSize="xs" color={descColor}>Keep it up.</Text>
        </Box>
        <Box
          as="button"
          ml="auto"
          flexShrink={0}
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
