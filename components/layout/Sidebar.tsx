'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react'

interface TrackProgress {
  trackId: string
  title: string
  color: string
  completedCount: number
  totalCount: number
}

export function Sidebar() {
  const pathname = usePathname()
  const [enrolledTracks, setEnrolledTracks] = useState<TrackProgress[]>([])

  const bg = useColorModeValue('#FFFFFF', '#1A1A1A')
  const borderColor = useColorModeValue('#E5E7EB', '#2D2D2D')
  const sectionLabelColor = useColorModeValue('#6B7280', '#9CA3AF')
  const trackTextColor = useColorModeValue('#374151', '#D1D5DB')
  const trackPctColor = useColorModeValue('#9CA3AF', '#6B7280')
  const progressTrackBg = useColorModeValue('#F3F4F6', '#2D2D2D')
  const activeNavBg = useColorModeValue('#F3F4F6', '#2D2D2D')
  const navHoverBg = useColorModeValue('#F3F4F6', '#252525')

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return
        const enrolled = (data.tracksProgress ?? []).filter(
          (t: TrackProgress) => t.completedCount > 0
        )
        setEnrolledTracks(enrolled)
      })
      .catch(() => {})
  }, [])

  return (
    <Box
      as="aside"
      position="fixed"
      left={0}
      top="56px"
      bottom={0}
      zIndex={20}
      w="240px"
      bg={bg}
      borderRight="1px solid"
      borderColor={borderColor}
      overflowY="auto"
      display={{ base: 'none', lg: 'flex' }}
      flexDirection="column"
    >
      {/* Main nav links */}
      <Box as="nav" px={3} pt={4} pb={2}>
        <SidebarNavLink href="/" label="Home" icon={<HomeIcon />} active={pathname === '/'} />
        <SidebarNavLink href="/review" label="Daily Review" icon={<ReviewIcon />} active={pathname === '/review'} />
        <SidebarNavLink href="/playground" label="Playground" icon={<PlaygroundIcon />} active={pathname === '/playground'} />
      </Box>

      <Box h="1px" bg={borderColor} mx={3} my={2} />

      {/* Enrolled tracks */}
      <Box px={3} pb={3} flex={1}>
        {enrolledTracks.length > 0 && (
          <Box mb={3}>
            <Text
              px={2}
              mb={1.5}
              fontSize="xs"
              fontWeight="500"
              textTransform="uppercase"
              letterSpacing="wider"
              color={sectionLabelColor}
              userSelect="none"
            >
              My Tracks
            </Text>
            <Box as="ul" display="flex" flexDirection="column" gap={0.5}>
              {enrolledTracks.map(track => {
                const pct = track.totalCount > 0 ? Math.round((track.completedCount / track.totalCount) * 100) : 0
                const isActive = pathname.includes(track.trackId)
                return (
                  <Box as="li" key={track.trackId}>
                    <Box
                      as={Link}
                      href={`/learn#${track.trackId}`}
                      display="flex"
                      alignItems="center"
                      gap={2.5}
                      px={2}
                      py={1.5}
                      borderRadius="md"
                      transition="background 0.1s"
                      bg={isActive ? activeNavBg : 'transparent'}
                      _hover={{ bg: navHoverBg }}
                    >
                      {/* Color dot */}
                      <Box
                        h="8px"
                        w="8px"
                        borderRadius="full"
                        flexShrink={0}
                        style={{ backgroundColor: track.color }}
                      />
                      {/* Title + progress bar */}
                      <Box flex={1} minW={0}>
                        <Text fontSize="sm" color={trackTextColor} noOfLines={1} lineHeight="tight">
                          {track.title}
                        </Text>
                        {pct > 0 && (
                          <Box
                            mt={1}
                            h="4px"
                            w="full"
                            bg={progressTrackBg}
                            borderRadius="full"
                            overflow="hidden"
                          >
                            <Box
                              h="full"
                              borderRadius="full"
                              style={{ width: `${pct}%`, backgroundColor: track.color }}
                            />
                          </Box>
                        )}
                      </Box>
                      {/* Completion % */}
                      <Text fontSize="xs" color={trackPctColor} sx={{ fontVariantNumeric: "tabular-nums" }} flexShrink={0}>
                        {pct}%
                      </Text>
                    </Box>
                  </Box>
                )
              })}
            </Box>
          </Box>
        )}

        {/* Browse Library link */}
        <SidebarNavLink href="/" label="Browse Library" icon={<LibraryIcon />} active={false} />
      </Box>

      {/* Profile link at bottom */}
      <Box px={3} pb={4} borderTop="1px solid" borderColor={borderColor} pt={3}>
        <SidebarNavLink
          href="/profile"
          label="Profile"
          icon={<ProfileIcon />}
          active={pathname === '/profile'}
        />
      </Box>
    </Box>
  )
}

// ─── Sidebar nav link ─────────────────────────────────────────────────────────

function SidebarNavLink({
  href,
  label,
  icon,
  active,
}: {
  href: string
  label: string
  icon: React.ReactNode
  active: boolean
}) {
  const activeColor = useColorModeValue('#2563EB', '#2563EB')
  const activeBg = useColorModeValue('#EFF6FF', '#1D2D44')
  const defaultColor = useColorModeValue('#374151', '#D1D5DB')
  const hoverBg = useColorModeValue('#F3F4F6', '#2D2D2D')

  return (
    <Box
      as={Link}
      href={href}
      display="flex"
      alignItems="center"
      gap={2.5}
      px={2}
      py={2}
      borderRadius="lg"
      fontSize="sm"
      transition="background 0.1s"
      bg={active ? activeBg : 'transparent'}
      color={active ? activeColor : defaultColor}
      fontWeight={active ? '500' : 'normal'}
      _hover={{ bg: active ? activeBg : hoverBg }}
    >
      <Box flexShrink={0} opacity={0.7}>{icon}</Box>
      {label}
    </Box>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function HomeIcon() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}

function ReviewIcon() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  )
}

function PlaygroundIcon() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function LibraryIcon() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}
