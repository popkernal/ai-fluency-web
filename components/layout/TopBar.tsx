'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react'
import { ProgressBar } from '@/components/ui/ProgressBar'

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 900, 1400, 2100, 3000, 4200, 5700, 7500]

function xpProgress(totalXP: number): { current: number; needed: number } {
  let level = 1
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) { level = i + 1; break }
  }
  const lo = LEVEL_THRESHOLDS[level - 1] ?? 0
  const hi = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
  return { current: totalXP - lo, needed: hi - lo }
}

export function TopBar() {
  const [streak, setStreak] = useState(0)
  const [xp, setXp] = useState(0)
  const [level, setLevel] = useState(1)
  const [avatarFallback, setAvatarFallback] = useState('U')

  const bg = useColorModeValue('#FFFFFF', '#1A1A1A')
  const borderColor = useColorModeValue('#E5E7EB', '#2D2D2D')
  const titleColor = useColorModeValue('#1A1A1A', '#F5F5F5')
  const mutedColor = useColorModeValue('#6B7280', '#9CA3AF')
  const avatarBg = useColorModeValue('#E5E7EB', '#2D2D2D')

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return
        setStreak(data.user.currentStreak ?? 0)
        setXp(data.user.xpTotal ?? 0)
        setLevel(data.user.level ?? 1)
        setAvatarFallback((data.user.displayName ?? 'U').charAt(0).toUpperCase())
      })
      .catch(() => {})
  }, [])

  const { current: xpIntoLevel, needed: xpToNextLevel } = xpProgress(xp)

  return (
    <Box
      as="header"
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={30}
      h="56px"
      bg={bg}
      borderBottom="1px solid"
      borderColor={borderColor}
      display="flex"
      alignItems="center"
      px={{ base: 3, sm: 4 }}
      gap={{ base: 2, sm: 4 }}
    >
      {/* Logo */}
      <Box as={Link} href="/" display="flex" alignItems="center" gap={2} flexShrink={0}>
        <Text fontSize="h4" color={titleColor} fontWeight="600">
          AI Fluency
        </Text>
      </Box>

      {/* Spacer */}
      <Box flex={1} />

      {/* Right side: streak + XP bar + avatar */}
      <Flex alignItems="center" gap={4}>
        {/* Streak badge */}
        {streak > 0 && (
          <Flex alignItems="center" gap={1}>
            <Text fontSize="sm">🔥</Text>
            <Text fontSize="sm" fontWeight="500" color={mutedColor} sx={{ fontVariantNumeric: "tabular-nums" }}>
              {streak}
            </Text>
          </Flex>
        )}

        {/* XP mini progress bar */}
        <Flex display={{ base: 'none', sm: 'flex' }} alignItems="center" gap={2}>
          <ProgressBar value={xpIntoLevel} max={xpToNextLevel} color="#2563EB" size="xs" />
          <Text fontSize="xs" color={mutedColor} sx={{ fontVariantNumeric: "tabular-nums" }} whiteSpace="nowrap">
            Lv{level}
          </Text>
        </Flex>

        {/* Avatar */}
        <Box as={Link} href="/profile" aria-label="Profile">
          <Flex
            h="28px"
            w="28px"
            borderRadius="full"
            bg={avatarBg}
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize="xs" fontWeight="500" color={mutedColor} userSelect="none">
              {avatarFallback}
            </Text>
          </Flex>
        </Box>
      </Flex>
    </Box>
  )
}
