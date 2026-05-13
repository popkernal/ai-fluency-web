'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react'
import { createClient } from '@/lib/supabase-client'

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function CreateOrgPage() {
  const router = useRouter()

  const [orgName, setOrgName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManual, setSlugManual] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState<{ slug: string; inviteLink: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const inputBorder = useColorModeValue('#E5E7EB', '#2D2D2D')
  const inputBg = useColorModeValue('#FFFFFF', '#141414')
  const prefixBg = useColorModeValue('#F9FAFB', '#1C1C1C')
  const monoText = useColorModeValue('#374151', '#D1D5DB')
  const mutedText = useColorModeValue('#9CA3AF', '#6B7280')
  const codeBg = useColorModeValue('#F3F4F6', '#1C1C1C')

  function handleNameChange(name: string) {
    setOrgName(name)
    if (!slugManual) setSlug(slugify(name))
  }

  function handleSlugChange(s: string) {
    setSlugManual(true)
    setSlug(slugify(s))
  }

  async function handleCreate(e: React.FormEvent) {
    const supabase = createClient()
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: org, error: orgErr } = await supabase
      .from('organizations')
      .insert({ name: orgName, slug, created_by: user.id })
      .select('id, slug')
      .single()

    if (orgErr) {
      setError(orgErr.message.includes('unique') ? 'That slug is already taken. Try a different name.' : orgErr.message)
      setLoading(false)
      return
    }

    await supabase.from('org_members').insert({
      org_id: org.id,
      user_id: user.id,
      role: 'owner',
      status: 'active',
      joined_at: new Date().toISOString(),
    })

    await supabase.from('users').update({ org_id: org.id }).eq('id', user.id)

    const inviteCode = org.slug + '-' + Math.random().toString(36).slice(2, 8)
    await supabase.from('org_invites').insert({
      org_id: org.id,
      invite_code: inviteCode,
      role: 'member',
    })

    const origin = window.location.origin
    setCreated({ slug: org.slug, inviteLink: origin + '/join/' + inviteCode })
    setLoading(false)
  }

  async function copyLink() {
    if (!created) return
    await navigator.clipboard.writeText(created.inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '12px',
    fontSize: '14px',
    border: '1px solid ' + inputBorder,
    backgroundColor: inputBg,
    color: 'inherit',
    outline: 'none',
  }

  if (created) {
    return (
      <Box maxW="md" mx="auto" py={10} px={4} display="flex" flexDirection="column" gap={6}>
        <Box textAlign="center">
          <Text fontSize="4xl" mb={3}>🎉</Text>
          <Text fontSize="2xl" fontWeight="bold" color="text.primary">Organization created</Text>
          <Text fontSize="sm" color="text.secondary" mt={1}>
            Share this link with your team to invite them.
          </Text>
        </Box>

        <Box
          borderRadius="xl"
          border="1px solid"
          borderColor="border.default"
          bg="surface"
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
        >
          <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="widest" color={mutedText}>
            Invite link
          </Text>
          <Flex alignItems="center" gap={2}>
            <Box
              as="code"
              flex={1}
              fontSize="xs"
              fontFamily="mono"
              color={monoText}
              bg={codeBg}
              borderRadius="lg"
              px={3}
              py={2}
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
            >
              {created.inviteLink}
            </Box>
            <Box
              as="button"
              onClick={copyLink}
              flexShrink={0}
              px={3}
              py={2}
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
          <Text fontSize="11px" color={mutedText}>
            This link expires in 7 days. You can generate new links from your org settings.
          </Text>
        </Box>

        <Box
          as="button"
          onClick={() => router.push('/')}
          w="full"
          py={3}
          borderRadius="xl"
          bg="#E8601C"
          color="white"
          fontSize="sm"
          fontWeight="semibold"
          _hover={{ opacity: 0.9 }}
          transition="opacity 0.15s"
        >
          Go to dashboard
        </Box>
      </Box>
    )
  }

  return (
    <Box maxW="md" mx="auto" py={10} px={4} display="flex" flexDirection="column" gap={6}>
      <Box>
        <Text fontSize="2xl" fontWeight="bold" color="text.primary">Create organization</Text>
        <Text fontSize="sm" color="text.secondary" mt={1}>
          Set up a team workspace and invite your colleagues.
        </Text>
      </Box>

      <Box as="form" onSubmit={handleCreate} display="flex" flexDirection="column" gap={4}>
        <Box display="flex" flexDirection="column" gap="6px">
          <Text as="label" fontSize="xs" fontWeight="medium" color="text.secondary" textTransform="uppercase" letterSpacing="wider">
            Organization name
          </Text>
          <input
            type="text"
            value={orgName}
            onChange={e => handleNameChange(e.target.value)}
            placeholder="Acme Corp"
            required
            style={inputStyle}
          />
        </Box>

        <Box display="flex" flexDirection="column" gap="6px">
          <Text as="label" fontSize="xs" fontWeight="medium" color="text.secondary" textTransform="uppercase" letterSpacing="wider">
            URL slug
          </Text>
          <Flex
            borderRadius="xl"
            border="1px solid"
            borderColor="border.default"
            overflow="hidden"
            _focusWithin={{ ring: '2px', ringColor: 'rgba(232,96,28,0.3)', borderColor: '#E8601C' }}
            transition="colors 0.15s"
          >
            <Box
              px={3}
              py="10px"
              fontSize="sm"
              color={mutedText}
              bg={prefixBg}
              borderRight="1px solid"
              borderColor="border.default"
              flexShrink={0}
              whiteSpace="nowrap"
            >
              /join/
            </Box>
            <input
              type="text"
              value={slug}
              onChange={e => handleSlugChange(e.target.value)}
              placeholder="acme-corp"
              required
              style={{ flex: 1, padding: '10px 12px', fontSize: '14px', backgroundColor: inputBg, color: 'inherit', outline: 'none', border: 'none' }}
            />
          </Flex>
          <Text fontSize="11px" color={mutedText}>
            Auto-generated from name. Lowercase letters, numbers and hyphens only.
          </Text>
        </Box>

        {error && (
          <Text fontSize="xs" color="red.500" bg="red.50" _dark={{ bg: 'rgba(127,29,29,0.3)' }} borderRadius="lg" px={3} py={2}>
            {error}
          </Text>
        )}

        <Box
          as="button"
          type="submit"
          disabled={loading || !orgName || !slug}
          w="full"
          py={3}
          borderRadius="xl"
          fontSize="sm"
          fontWeight="semibold"
          bg="#E8601C"
          color="white"
          opacity={loading || !orgName || !slug ? 0.5 : 1}
          cursor={loading || !orgName || !slug ? 'not-allowed' : 'pointer'}
          _hover={{ opacity: 0.9 }}
          transition="opacity 0.15s"
        >
          {loading ? 'Creating…' : 'Create organization'}
        </Box>
      </Box>
    </Box>
  )
}
