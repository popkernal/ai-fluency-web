'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react'

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const bg = useColorModeValue('#FFFFFF', '#0A0A0A')
  const primaryColor = useColorModeValue('#1A1A1A', '#F5F5F5')
  const secondaryColor = useColorModeValue('#6B7280', '#9CA3AF')
  const tabBarBg = useColorModeValue('#F3F4F6', '#1C1C1C')
  const activeTabBg = useColorModeValue('#FFFFFF', '#2A2A2A')
  const inputBg = useColorModeValue('#FFFFFF', '#1C1C1C')
  const inputBorder = useColorModeValue('#E5E7EB', '#2D2D2D')
  const placeholderColor = useColorModeValue('#9CA3AF', '#6B7280')
  const errorBg = useColorModeValue('#FEF2F2', 'rgba(127,29,29,0.3)')
  const successColor = useColorModeValue('#15803D', '#86EFAC')
  const successBg = useColorModeValue('#F0FDF4', 'rgba(20,83,45,0.3)')
  const footerMuted = useColorModeValue('#9CA3AF', '#6B7280')

  async function handleSignIn(e: React.FormEvent) {
    const supabase = createClient()
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from('users')
        .select('onboarding_completed')
        .eq('id', data.user.id)
        .single()

      if (profile?.onboarding_completed) {
        router.push('/')
      } else {
        router.push('/onboarding')
      }
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    const supabase = createClient()
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName || email.split('@')[0] },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.user && !data.session) {
      setSuccess('Check your email to confirm your account, then sign in.')
      setLoading(false)
      return
    }

    router.push('/onboarding')
  }

  return (
    <Box
      position="fixed"
      inset={0}
      bg={bg}
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
      zIndex={50}
    >
      <Box w="full" maxW="380px" display="flex" flexDirection="column" gap={6}>
        {/* Logo */}
        <Box textAlign="center">
          <Text fontSize="24px" fontWeight="bold" color={primaryColor} letterSpacing="tight">
            AI Fluency
          </Text>
          <Text fontSize="sm" color={secondaryColor} mt={1}>
            Learn AI the smart way.
          </Text>
        </Box>

        {/* Tab switcher */}
        <Flex bg={tabBarBg} borderRadius="xl" p={1} gap={1}>
          {(['signin', 'signup'] as const).map(t => (
            <Box
              key={t}
              as="button"
              flex={1}
              py={2}
              fontSize="sm"
              fontWeight="medium"
              borderRadius="lg"
              transition="colors 0.15s"
              bg={tab === t ? activeTabBg : 'transparent'}
              color={tab === t ? primaryColor : secondaryColor}
              boxShadow={tab === t ? 'sm' : 'none'}
              onClick={() => { setTab(t); setError(null); setSuccess(null) }}
            >
              {t === 'signin' ? 'Sign in' : 'Sign up'}
            </Box>
          ))}
        </Flex>

        {/* Form */}
        <Box as="form" onSubmit={tab === 'signin' ? handleSignIn : handleSignUp} display="flex" flexDirection="column" gap={3}>
          {tab === 'signup' && (
            <Box display="flex" flexDirection="column" gap={1}>
              <Text fontSize="xs" fontWeight="medium" color={secondaryColor} textTransform="uppercase" letterSpacing="wide">
                Name
              </Text>
              <Box
                as="input"
                type="text"
                value={displayName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDisplayName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                w="full"
                px="14px"
                py="10px"
                borderRadius="xl"
                fontSize="sm"
                border="1px solid"
                borderColor={inputBorder}
                bg={inputBg}
                color={primaryColor}
                _placeholder={{ color: placeholderColor }}
                _focus={{ outline: 'none', borderColor: '#E8601C', boxShadow: '0 0 0 3px rgba(232,96,28,0.15)' }}
                transition="colors 0.15s"
              />
            </Box>
          )}

          <Box display="flex" flexDirection="column" gap={1}>
            <Text fontSize="xs" fontWeight="medium" color={secondaryColor} textTransform="uppercase" letterSpacing="wide">
              Email
            </Text>
            <Box
              as="input"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              w="full"
              px="14px"
              py="10px"
              borderRadius="xl"
              fontSize="sm"
              border="1px solid"
              borderColor={inputBorder}
              bg={inputBg}
              color={primaryColor}
              _placeholder={{ color: placeholderColor }}
              _focus={{ outline: 'none', borderColor: '#E8601C', boxShadow: '0 0 0 3px rgba(232,96,28,0.15)' }}
              transition="colors 0.15s"
            />
          </Box>

          <Box display="flex" flexDirection="column" gap={1}>
            <Text fontSize="xs" fontWeight="medium" color={secondaryColor} textTransform="uppercase" letterSpacing="wide">
              Password
            </Text>
            <Box
              as="input"
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              placeholder={tab === 'signup' ? 'At least 8 characters' : '••••••••'}
              required
              minLength={tab === 'signup' ? 8 : undefined}
              autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
              w="full"
              px="14px"
              py="10px"
              borderRadius="xl"
              fontSize="sm"
              border="1px solid"
              borderColor={inputBorder}
              bg={inputBg}
              color={primaryColor}
              _placeholder={{ color: placeholderColor }}
              _focus={{ outline: 'none', borderColor: '#E8601C', boxShadow: '0 0 0 3px rgba(232,96,28,0.15)' }}
              transition="colors 0.15s"
            />
          </Box>

          {error && (
            <Text fontSize="xs" color="#EF4444" bg={errorBg} borderRadius="lg" px={3} py={2}>
              {error}
            </Text>
          )}

          {success && (
            <Text fontSize="xs" color={successColor} bg={successBg} borderRadius="lg" px={3} py={2}>
              {success}
            </Text>
          )}

          <Box
            as="button"
            type="submit"
            disabled={loading}
            w="full"
            py={3}
            borderRadius="xl"
            fontSize="sm"
            fontWeight="semibold"
            bg="#E8601C"
            color="white"
            opacity={loading ? 0.6 : 1}
            cursor={loading ? 'not-allowed' : 'pointer'}
            _hover={{ opacity: loading ? 0.6 : 0.9 }}
            transition="opacity 0.15s"
          >
            {loading
              ? tab === 'signin' ? 'Signing in…' : 'Creating account…'
              : tab === 'signin' ? 'Sign in' : 'Create account'
            }
          </Box>
        </Box>

        <Text textAlign="center" fontSize="xs" color={footerMuted}>
          By continuing you agree to our Terms of Service and Privacy Policy.
        </Text>
      </Box>
    </Box>
  )
}
