'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react'
import type { AdminUserRow } from '@/lib/adminEngine'

interface Props {
  users: AdminUserRow[]
  initialSearch: string
}

const PLAN_BADGE_COLORS: Record<string, { bg: string; darkBg: string; color: string; darkColor: string }> = {
  free:       { bg: '#F3F4F6', darkBg: '#2D2D2D', color: '#6B7280', darkColor: '#9CA3AF' },
  pro:        { bg: '#EFF6FF', darkBg: 'rgba(30,58,138,0.3)', color: '#1D4ED8', darkColor: '#60A5FA' },
  team:       { bg: '#F5F3FF', darkBg: 'rgba(76,29,149,0.3)', color: '#7C3AED', darkColor: '#A78BFA' },
  enterprise: { bg: '#FFFBEB', darkBg: 'rgba(120,53,15,0.3)', color: '#B45309', darkColor: '#FCD34D' },
}

export function UsersTableClient({ users, initialSearch }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState(initialSearch)

  const isDark = useColorModeValue(false, true)
  const tableBorder = useColorModeValue('#E5E7EB', '#2D2D2D')
  const theadBg = useColorModeValue('#F9FAFB', '#1C1C1C')
  const rowHoverBg = useColorModeValue('#F9FAFB', '#1C1C1C')
  const inputBorder = useColorModeValue('#E5E7EB', '#2D2D2D')
  const inputBg = useColorModeValue('#FFFFFF', '#141414')
  const primaryText = useColorModeValue('#1A1A1A', '#F5F5F5')
  const secondaryText = useColorModeValue('#6B7280', '#9CA3AF')
  const mutedText = useColorModeValue('#9CA3AF', '#6B7280')

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search.trim()) params.set('q', search.trim())
    router.push('/admin/users?' + params.toString())
  }, [search, router])

  function formatDate(iso: string | null): string {
    if (!iso) return 'Never'
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
  }

  function getPlanBadgeStyle(plan: string) {
    const colors = PLAN_BADGE_COLORS[plan] ?? PLAN_BADGE_COLORS.free
    return {
      backgroundColor: isDark ? colors.darkBg : colors.bg,
      color: isDark ? colors.darkColor : colors.color,
    }
  }

  const thBase = { padding: '10px 12px', textAlign: 'left' as const, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em', color: secondaryText }

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      {/* Search */}
      <Flex as="form" onSubmit={handleSearch} gap={2}>
        <Box
          as="input"
          type="search"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          flex={1}
          px="14px"
          py={2}
          borderRadius="xl"
          fontSize="sm"
          border="1px solid"
          borderColor="border.default"
          bg={inputBg}
          color="text.primary"
          _placeholder={{ color: mutedText }}
          _focus={{ outline: 'none', borderColor: '#E8601C', boxShadow: '0 0 0 3px rgba(232,96,28,0.15)' }}
          transition="colors 0.15s"
        />
        <Box
          as="button"
          type="submit"
          px={4}
          py={2}
          borderRadius="xl"
          bg="#2563EB"
          color="white"
          fontSize="sm"
          fontWeight="medium"
          _hover={{ bg: '#1D4ED8' }}
          transition="colors 0.15s"
        >
          Search
        </Box>
      </Flex>

      {/* Table */}
      <Box borderRadius="xl" border="1px solid" borderColor="border.default" overflow="hidden">
        <Box overflowX="auto">
          <Box as="table" w="full" style={{ fontSize: '14px', borderCollapse: 'collapse' }}>
            <Box as="thead" style={{ backgroundColor: theadBg, borderBottom: '1px solid ' + tableBorder }}>
              <Box as="tr">
                <Box as="th" style={thBase}>Name</Box>
                <Box as="th" style={thBase}>Email</Box>
                <Box as="th" style={thBase}>Org</Box>
                <Box as="th" style={{ ...thBase, textAlign: 'right' }}>Level</Box>
                <Box as="th" style={{ ...thBase, textAlign: 'right' }}>Lessons</Box>
                <Box as="th" style={{ ...thBase, textAlign: 'right' }}>Streak</Box>
                <Box as="th" style={thBase}>Plan</Box>
                <Box as="th" style={thBase}>Last active</Box>
              </Box>
            </Box>
            <Box as="tbody">
              {users.map(u => (
                <Box
                  key={u.id}
                  as="tr"
                  style={{ borderBottom: '1px solid ' + tableBorder, transition: 'background-color 0.15s' }}
                  _hover={{ bg: rowHoverBg }}
                >
                  <Box as="td" style={{ padding: '10px 12px' }}>
                    <Box
                      as={Link}
                      href={'/admin/users/' + u.id}
                      fontWeight="medium"
                      color={primaryText}
                      _hover={{ color: '#E8601C' }}
                      transition="colors 0.15s"
                    >
                      {u.displayName}
                    </Box>
                  </Box>
                  <Box as="td" style={{ padding: '10px 12px', fontSize: '12px', color: secondaryText }}>{u.email}</Box>
                  <Box as="td" style={{ padding: '10px 12px', fontSize: '12px', color: secondaryText }}>{u.orgName ?? '—'}</Box>
                  <Box as="td" style={{ padding: '10px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: primaryText }}>{u.level}</Box>
                  <Box as="td" style={{ padding: '10px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: primaryText }}>{u.lessonsCompleted}</Box>
                  <Box as="td" style={{ padding: '10px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: primaryText }}>
                    {u.currentStreak > 0 ? u.currentStreak + 'd' : '—'}
                  </Box>
                  <Box as="td" style={{ padding: '10px 12px' }}>
                    <Box
                      as="span"
                      display="inline-flex"
                      px={2}
                      py="2px"
                      borderRadius="full"
                      fontSize="xs"
                      fontWeight="medium"
                      style={getPlanBadgeStyle(u.plan)}
                    >
                      {u.plan}
                    </Box>
                  </Box>
                  <Box as="td" style={{ padding: '10px 12px', fontSize: '12px', color: secondaryText }}>{formatDate(u.lastActive)}</Box>
                </Box>
              ))}
              {users.length === 0 && (
                <Box as="tr">
                  <Box as="td" colSpan={8} style={{ padding: '32px 12px', textAlign: 'center', fontSize: '14px', color: mutedText }}>
                    No users found.
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
