'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Box, Flex, Text, SimpleGrid, useColorModeValue } from '@chakra-ui/react'
import type { OrgDashboardData } from '@/lib/adminEngine'

interface Props {
  data: OrgDashboardData
}

export function OrgDashboardClient({ data }: Props) {
  const { org, members, pendingInvites, teamStats } = data
  const [inviteLoading, setInviteLoading] = useState(false)
  const [newInviteLink, setNewInviteLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [csvLoading, setCsvLoading] = useState(false)

  const isDark = useColorModeValue(false, true)
  const tableBorder = useColorModeValue('#E5E7EB', '#2D2D2D')
  const theadBg = useColorModeValue('#F9FAFB', '#1C1C1C')
  const rowHoverBg = useColorModeValue('#F9FAFB', '#1C1C1C')
  const monoText = useColorModeValue('#374151', '#D1D5DB')
  const secondaryText = useColorModeValue('#6B7280', '#9CA3AF')
  const mutedText = useColorModeValue('#9CA3AF', '#6B7280')
  const primaryText = useColorModeValue('#1A1A1A', '#F5F5F5')
  const inviteLinkBg = useColorModeValue('#F0FDF4', '#0A2010')
  const codeInviteBg = useColorModeValue('#F3F4F6', '#1C1C1C')

  const ROLE_BADGE_COLORS: Record<string, { bg: string; darkBg: string; color: string; darkColor: string }> = {
    owner:  { bg: '#FFFBEB', darkBg: 'rgba(120,53,15,0.3)', color: '#B45309', darkColor: '#FCD34D' },
    admin:  { bg: '#EFF6FF', darkBg: 'rgba(30,58,138,0.3)', color: '#1D4ED8', darkColor: '#60A5FA' },
    member: { bg: '#F3F4F6', darkBg: '#2D2D2D', color: '#6B7280', darkColor: '#9CA3AF' },
  }

  function getRoleBadgeStyle(role: string) {
    const c = ROLE_BADGE_COLORS[role] ?? ROLE_BADGE_COLORS.member
    return { backgroundColor: isDark ? c.darkBg : c.bg, color: isDark ? c.darkColor : c.color }
  }

  async function generateInvite() {
    setInviteLoading(true)
    try {
      const res = await fetch('/api/admin/org/' + org.id + '/invite', { method: 'POST' })
      if (res.ok) {
        const { inviteLink } = await res.json()
        setNewInviteLink(inviteLink)
      }
    } catch { /* silently skip */ }
    setInviteLoading(false)
  }

  async function copyLink(link: string) {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function exportCSV() {
    setCsvLoading(true)
    try {
      const res = await fetch('/api/admin/org/' + org.id + '/export-csv')
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = org.slug + '-members-' + new Date().toISOString().slice(0, 10) + '.csv'
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch { /* silently skip */ }
    setCsvLoading(false)
  }

  function formatDate(iso: string | null): string {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
  }

  const thBase = { padding: '10px 12px', textAlign: 'left' as const, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em', color: secondaryText }

  return (
    <Box display="flex" flexDirection="column" gap={6} maxW="5xl">
      {/* Back */}
      <Box
        as={Link}
        href="/admin/users"
        display="inline-flex"
        alignItems="center"
        gap={1}
        fontSize="sm"
        color="text.secondary"
        _hover={{ color: '#E8601C' }}
        transition="colors 0.15s"
      >
        ← Users
      </Box>

      {/* Org header */}
      <Flex alignItems="flex-start" justifyContent="space-between" gap={4} flexWrap="wrap">
        <Box>
          <Text fontSize="22px" fontWeight="bold" color="text.primary">{org.name}</Text>
          <Text fontSize="sm" color="text.secondary" mt="2px">
            {org.slug} · {org.plan} plan · {data.memberCount}/{org.maxSeats} seats
          </Text>
        </Box>
        <Box
          as="button"
          onClick={exportCSV}
          disabled={csvLoading}
          display="flex"
          alignItems="center"
          gap="6px"
          px="14px"
          py={2}
          borderRadius="xl"
          fontSize="sm"
          fontWeight="medium"
          border="1px solid"
          borderColor="border.default"
          bg="surface"
          color="text.primary"
          _hover={{ borderColor: '#9CA3AF' }}
          _disabled={{ opacity: 0.5, pointerEvents: 'none' }}
          transition="colors 0.15s"
        >
          <svg style={{ height: 16, width: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {csvLoading ? 'Exporting…' : 'Export CSV'}
        </Box>
      </Flex>

      {/* Team stats */}
      <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3}>
        <Box borderRadius="xl" border="1px solid" borderColor="border.default" bg="surface" p={4}>
          <Text fontSize="xs" color="text.secondary">Avg lessons / week</Text>
          <Text fontSize="2xl" fontWeight="bold" color="text.primary" sx={{ fontVariantNumeric: "tabular-nums" }} mt={1}>{teamStats.avgLessonsPerWeek}</Text>
        </Box>
        <Box borderRadius="xl" border="1px solid" borderColor="border.default" bg="surface" p={4}>
          <Text fontSize="xs" color="text.secondary">Avg level</Text>
          <Text fontSize="2xl" fontWeight="bold" color="text.primary" sx={{ fontVariantNumeric: "tabular-nums" }} mt={1}>{teamStats.avgLevel}</Text>
        </Box>
        <Box borderRadius="xl" border="1px solid" borderColor="border.default" bg="surface" p={4}>
          <Text fontSize="xs" color="text.secondary">Total lessons completed</Text>
          <Text fontSize="2xl" fontWeight="bold" color="text.primary" sx={{ fontVariantNumeric: "tabular-nums" }} mt={1}>{teamStats.totalLessonsCompleted}</Text>
        </Box>
      </SimpleGrid>

      {/* Members table */}
      <Box display="flex" flexDirection="column" gap={2}>
        <Text fontSize="sm" fontWeight="semibold" color="text.primary">Members ({data.memberCount})</Text>
        <Box borderRadius="xl" border="1px solid" borderColor="border.default" overflow="hidden">
          <Box overflowX="auto">
            <Box as="table" w="full" style={{ fontSize: '14px', borderCollapse: 'collapse' }}>
              <Box as="thead" style={{ backgroundColor: theadBg, borderBottom: '1px solid ' + tableBorder }}>
                <Box as="tr">
                  <Box as="th" style={thBase}>Name</Box>
                  <Box as="th" style={thBase}>Role</Box>
                  <Box as="th" style={{ ...thBase, textAlign: 'right' }}>Level</Box>
                  <Box as="th" style={{ ...thBase, textAlign: 'right' }}>Lessons</Box>
                  <Box as="th" style={{ ...thBase, textAlign: 'right' }}>Streak</Box>
                  <Box as="th" style={thBase}>Last active</Box>
                  <Box as="th" style={thBase}>Joined</Box>
                </Box>
              </Box>
              <Box as="tbody">
                {members.map(m => (
                  <Box
                    key={m.userId}
                    as="tr"
                    style={{ borderBottom: '1px solid ' + tableBorder, transition: 'background-color 0.15s' }}
                    _hover={{ bg: rowHoverBg }}
                  >
                    <Box as="td" style={{ padding: '10px 12px' }}>
                      <Box
                        as={Link}
                        href={'/admin/users/' + m.userId}
                        fontWeight="medium"
                        color={primaryText}
                        _hover={{ color: '#E8601C' }}
                        transition="colors 0.15s"
                        display="block"
                      >
                        {m.displayName}
                      </Box>
                      <Text fontSize="xs" color={mutedText}>{m.email}</Text>
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
                        style={getRoleBadgeStyle(m.role)}
                      >
                        {m.role}
                      </Box>
                    </Box>
                    <Box as="td" style={{ padding: '10px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{m.level}</Box>
                    <Box as="td" style={{ padding: '10px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{m.lessonsCompleted}</Box>
                    <Box as="td" style={{ padding: '10px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      {m.currentStreak > 0 ? m.currentStreak + 'd' : '—'}
                    </Box>
                    <Box as="td" style={{ padding: '10px 12px', fontSize: '12px', color: secondaryText }}>{formatDate(m.lastActive)}</Box>
                    <Box as="td" style={{ padding: '10px 12px', fontSize: '12px', color: secondaryText }}>{formatDate(m.joinedAt)}</Box>
                  </Box>
                ))}
                {members.length === 0 && (
                  <Box as="tr">
                    <Box as="td" colSpan={7} style={{ padding: '32px 12px', textAlign: 'center', fontSize: '14px', color: mutedText }}>No members yet.</Box>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Invite management */}
      <Box display="flex" flexDirection="column" gap={3}>
        <Flex alignItems="center" justifyContent="space-between">
          <Text fontSize="sm" fontWeight="semibold" color="text.primary">
            Pending invites ({pendingInvites.length})
          </Text>
          <Box
            as="button"
            onClick={generateInvite}
            disabled={inviteLoading}
            px={3}
            py="6px"
            borderRadius="lg"
            fontSize="xs"
            fontWeight="semibold"
            bg="#2563EB"
            color="white"
            _hover={{ bg: '#1D4ED8' }}
            _disabled={{ opacity: 0.5, pointerEvents: 'none' }}
            transition="colors 0.15s"
          >
            {inviteLoading ? 'Generating…' : '+ New invite link'}
          </Box>
        </Flex>

        {/* Newly generated link */}
        {newInviteLink && (
          <Flex
            borderRadius="xl"
            border="1px solid"
            borderColor="border.default"
            bg={inviteLinkBg}
            p={3}
            alignItems="center"
            gap={2}
          >
            <Box
              as="code"
              flex={1}
              fontSize="xs"
              fontFamily="mono"
              color={monoText}
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
            >
              {newInviteLink}
            </Box>
            <Box
              as="button"
              onClick={() => copyLink(newInviteLink)}
              flexShrink={0}
              px="10px"
              py={1}
              borderRadius="lg"
              fontSize="xs"
              fontWeight="semibold"
              transition="colors 0.15s"
              bg={copied ? '#D1FAE5' : '#E8601C'}
              color={copied ? '#065F46' : 'white'}
              _hover={{ opacity: 0.9 }}
            >
              {copied ? 'Copied!' : 'Copy'}
            </Box>
          </Flex>
        )}

        {pendingInvites.length > 0 && (
          <Box borderRadius="xl" border="1px solid" borderColor="border.default" overflow="hidden">
            <Box as="table" w="full" style={{ fontSize: '14px', borderCollapse: 'collapse' }}>
              <Box as="thead" style={{ backgroundColor: theadBg, borderBottom: '1px solid ' + tableBorder }}>
                <Box as="tr">
                  <Box as="th" style={thBase}>Invite code</Box>
                  <Box as="th" style={thBase}>Email</Box>
                  <Box as="th" style={thBase}>Role</Box>
                  <Box as="th" style={thBase}>Expires</Box>
                </Box>
              </Box>
              <Box as="tbody">
                {pendingInvites.map(inv => (
                  <Box key={inv.id} as="tr" style={{ borderBottom: '1px solid ' + tableBorder }}>
                    <Box as="td" style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: '12px', color: monoText }}>{inv.inviteCode}</Box>
                    <Box as="td" style={{ padding: '8px 12px', fontSize: '12px', color: secondaryText }}>{inv.email ?? 'Open link'}</Box>
                    <Box as="td" style={{ padding: '8px 12px', fontSize: '12px' }}>{inv.role}</Box>
                    <Box as="td" style={{ padding: '8px 12px', fontSize: '12px', color: secondaryText }}>{formatDate(inv.expiresAt)}</Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}
