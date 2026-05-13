'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react'

const NAV_ITEMS = [
  { href: '/',           label: 'Home',      icon: HomeIcon },
  { href: '/review',     label: 'Review',    icon: ReviewIcon },
  { href: '/playground', label: 'Playground',icon: PlaygroundIcon },
  { href: '/profile',    label: 'Profile',   icon: ProfileIcon },
] as const

export function MobileNav() {
  const pathname = usePathname()
  const bg = useColorModeValue('#FFFFFF', '#1A1A1A')
  const borderColor = useColorModeValue('#E5E7EB', '#2D2D2D')

  return (
    <Box
      as="nav"
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      zIndex={30}
      bg={bg}
      borderTop="1px solid"
      borderColor={borderColor}
      h="72px"
      display={{ base: 'flex', md: 'none' }}
      alignItems="stretch"
      justifyContent="space-around"
      pb="env(safe-area-inset-bottom, 0px)"
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
        const color = isActive ? '#E8601C' : '#9CA3AF'

        return (
          <Box
            key={href}
            as={Link}
            href={href}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
            flex={1}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap={1}
            pt={1}
            color={color}
            transition="color 0.1s"
          >
            <Icon active={isActive} />
            <Text fontSize="9px" fontWeight="500" lineHeight={1} letterSpacing="wide" color={color}>
              {label}
            </Text>
          </Box>
        )
      })}
    </Box>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function HomeIcon({ active }: { active: boolean }) {
  return active ? (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
  ) : (
    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}

function ReviewIcon({ active }: { active: boolean }) {
  return active ? (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M4 4a1 1 0 011-1h4v2H6v13h12V5h-3V3h4a1 1 0 011 1v15a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm5 7a1 1 0 011-1h4a1 1 0 110 2h-4a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2h-4a1 1 0 01-1-1zm2-9a1 1 0 011-1h0a1 1 0 011 1v2a1 1 0 01-1 1h0a1 1 0 01-1-1V5z" clipRule="evenodd" />
    </svg>
  ) : (
    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  )
}

function PlaygroundIcon({ active }: { active: boolean }) {
  return active ? (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M2 6a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm6.293 1.293a1 1 0 011.414 0L12 9.586l2.293-2.293a1 1 0 111.414 1.414L13.414 11l2.293 2.293a1 1 0 01-1.414 1.414L12 12.414l-2.293 2.293a1 1 0 01-1.414-1.414L10.586 11 8.293 8.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  ) : (
    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function ProfileIcon({ active }: { active: boolean }) {
  return active ? (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
  ) : (
    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}
