'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react'
import { createClient } from '@/lib/supabase-client'

interface OrgInvite {
  id: string
  org_id: string
  role: string
  expires_at: string
  used_at: string | null
  organizations: {
    name: string
    logo_url: string | null
    slug: string
  }
}

type PageState = 'loading' | 'invalid' | 'sign-in' | 'sign-up' | 'confirm' | 'joining' | 'done'

export default function JoinPage() {
  const router = useRouter()
  const params = useParams()
  const inviteCode = params.slug as string

  const supabase = createClient()

  const [pageState, setPageState] = useState<PageState>('loading')
  const [invite, setInvite] = useState<OrgInvite | null>(null)
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(false)

  const inputBorder = useColorModeValue('#E5E7EB', '#2D2D2D')
  const inputBg = useColorModeValue('#FFFFFF', '#1C1C1C')
  const pillBg = useColorModeValue('#F3F4F6', '#1C1C1C')
  const activePillBg = useColorModeValue('#FFFFFF', '#2A2A2A')
  const activePillColor = useColorModeValue('#1A1A1A', '#F5F5F5')
  const mutedText = useColorModeValue('#9CA3AF', '#6B7280')

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('org_invites')
        .select('id, org_id, role, expires_at, used_at, organizations(name, logo_url, slug)')
        .eq('invite_code', inviteCode)
        .single()

      if (error || !data) { setPageState('invalid'); return }

      const inv = data as unknown as OrgInvite
      const now = new Date()
      if (new Date(inv.expires_at) < now || inv.used_at) {
        setPageState('invalid')
        return
      }

      setInvite(inv)

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUser({ id: user.id, email: user.email ?? '' })
        setPageState('confirm')
      } else {
        setPageState('sign-up')
      }
    }
    load()
  }, [inviteCode]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setAuthError(null)
    setAuthLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName || email.split('@')[0] } },
    })

    if (error) { setAuthError(error.message); setAuthLoading(false); return }

    if (data.user && !data.session) {
      setAuthError('Check your email to confirm your account, then come back to this link.')
      setAuthLoading(false)
      return
    }

    if (data.user) {
      setCurrentUser({ id: data.user.id, email: data.user.email ?? '' })
      setPageState('confirm')
    }
    setAuthLoading(false)
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setAuthError(null)
    setAuthLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) { setAuthError(error.message); setAuthLoading(false); return }

    if (data.user) {
      setCurrentUser({ id: data.user.id, email: data.user.email ?? '' })
      setPageState('confirm')
    }
    setAuthLoading(false)
  }

  async function handleJoin() {
    if (!currentUser || !invite) return
    setPageState('joining')

    await supabase.from('org_members').upsert({
      org_id: invite.org_id,
      user_id: currentUser.id,
      role: invite.role,
      status: 'active',
      joined_at: new Date().toISOString(),
    }, { onConflict: 'org_id,user_id' })

    await supabase.from('users').update({ org_id: invite.org_id }).eq('id', currentUser.id)
    await supabase.from('org_invites').update({ used_at: new Date().toISOString() }).eq('id', invite.id)

    const { data: profile } = await supabase
      .from('users')
      .select('onboarding_completed')
      .eq('id', currentUser.id)
      .single()

    if (profile?.onboarding_completed) {
      router.push('/')
    } else {
      router.push('/onboarding')
    }
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

  if (pageState === 'loading') {
    return (
      <Flex minH="60vh" alignItems="center" justifyContent="center">
        <Text fontSize="sm" color={mutedText}>Loading…</Text>
      </Flex>
    )
  }

  if (pageState === 'invalid') {
    return (
      <Box maxW="sm" mx="auto" py={16} px={4} textAlign="center" display="flex" flexDirection="column" gap={4}>
        <Text fontSize="4xl">🔗</Text>
        <Text fontSize="xl" fontWeight="bold" color="text.primary">Link not valid</Text>
        <Text fontSize="sm" color="text.secondary">
          This invite link has expired, been used, or doesn't exist. Ask your team admin for a new link.
        </Text>
      </Box>
    )
  }

  const orgName = invite?.organizations?.name ?? 'the team'

  if (pageState === 'confirm' || pageState === 'joining') {
    return (
      <Box maxW="sm" mx="auto" py={16} px={4} display="flex" flexDirection="column" gap={6} textAlign="center">
        <Text fontSize="5xl">🏢</Text>
        <Box>
          <Text fontSize="sm" color="text.secondary">You've been invited to join</Text>
          <Text fontSize="2xl" fontWeight="bold" color="text.primary" mt={1}>{orgName}</Text>
          {currentUser && (
            <Text fontSize="sm" color={mutedText} mt={2}>as {currentUser.email}</Text>
          )}
        </Box>
        <Box
          as="button"
          onClick={handleJoin}
          disabled={pageState === 'joining'}
          w="full"
          py={3}
          borderRadius="xl"
          fontSize="sm"
          fontWeight="semibold"
          bg="#E8601C"
          color="white"
          opacity={pageState === 'joining' ? 0.6 : 1}
          cursor={pageState === 'joining' ? 'not-allowed' : 'pointer'}
          _hover={{ opacity: 0.9 }}
          transition="opacity 0.15s"
        >
          {pageState === 'joining' ? 'Joining…' : 'Join ' + orgName}
        </Box>
        <Text fontSize="xs" color={mutedText}>
          Not you?{' '}
          <Box
            as="button"
            color="#E8601C"
            _hover={{ textDecoration: 'underline' }}
            onClick={() => { supabase.auth.signOut(); setCurrentUser(null); setPageState('sign-up') }}
          >
            Sign out
          </Box>
        </Text>
      </Box>
    )
  }

  const isSignUp = pageState === 'sign-up'

  return (
    <Box maxW="sm" mx="auto" py={10} px={4} display="flex" flexDirection="column" gap={6}>
      <Box textAlign="center">
        <Text fontSize="4xl" mb={3}>🏢</Text>
        <Text fontSize="sm" color="text.secondary">You've been invited to join</Text>
        <Text fontSize="xl" fontWeight="bold" color="text.primary" mt={1}>{orgName}</Text>
      </Box>

      {/* Tab toggle */}
      <Flex borderRadius="xl" bg={pillBg} p={1} gap={1}>
        {(['sign-up', 'sign-in'] as const).map(t => (
          <Box
            key={t}
            as="button"
            flex={1}
            py={2}
            fontSize="sm"
            fontWeight="medium"
            borderRadius="lg"
            transition="colors 0.15s"
            bg={pageState === t ? activePillBg : 'transparent'}
            color={pageState === t ? activePillColor : 'text.secondary'}
            boxShadow={pageState === t ? 'sm' : 'none'}
            onClick={() => { setPageState(t); setAuthError(null) }}
          >
            {t === 'sign-up' ? 'Create account' : 'Sign in'}
          </Box>
        ))}
      </Flex>

      <Box as="form" onSubmit={isSignUp ? handleSignUp : handleSignIn} display="flex" flexDirection="column" gap={3}>
        {isSignUp && (
          <Box display="flex" flexDirection="column" gap={1}>
            <Text as="label" fontSize="xs" fontWeight="medium" color="text.secondary" textTransform="uppercase" letterSpacing="wider">Name</Text>
            <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" autoComplete="name" style={inputStyle} />
          </Box>
        )}
        <Box display="flex" flexDirection="column" gap={1}>
          <Text as="label" fontSize="xs" fontWeight="medium" color="text.secondary" textTransform="uppercase" letterSpacing="wider">Email</Text>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" style={inputStyle} />
        </Box>
        <Box display="flex" flexDirection="column" gap={1}>
          <Text as="label" fontSize="xs" fontWeight="medium" color="text.secondary" textTransform="uppercase" letterSpacing="wider">Password</Text>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={isSignUp ? 'At least 8 characters' : '••••••••'} required minLength={isSignUp ? 8 : undefined} autoComplete={isSignUp ? 'new-password' : 'current-password'} style={inputStyle} />
        </Box>

        {authError && (
          <Text fontSize="xs" color="red.500" bg="red.50" _dark={{ bg: 'rgba(127,29,29,0.3)' }} borderRadius="lg" px={3} py={2}>
            {authError}
          </Text>
        )}

        <Box
          as="button"
          type="submit"
          disabled={authLoading}
          w="full"
          py={3}
          borderRadius="xl"
          fontSize="sm"
          fontWeight="semibold"
          bg="#E8601C"
          color="white"
          opacity={authLoading ? 0.6 : 1}
          cursor={authLoading ? 'not-allowed' : 'pointer'}
          _hover={{ opacity: 0.9 }}
          transition="opacity 0.15s"
        >
          {authLoading
            ? (isSignUp ? 'Creating account…' : 'Signing in…')
            : (isSignUp ? 'Create account & join ' + orgName : 'Sign in & join ' + orgName)
          }
        </Box>
      </Box>
    </Box>
  )
}
