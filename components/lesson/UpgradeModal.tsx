'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Box, Text, Flex, Spinner, useColorModeValue } from '@chakra-ui/react'

interface UpgradeModalProps {
  open: boolean
  onClose: () => void
}

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    features: [
      '2 tracks (Foundations + Prompting)',
      '3 playground prompts / day',
      'No spaced repetition reviews',
    ],
    cta: null,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$20',
    period: '/mo',
    features: [
      'All 12 tracks — 68+ lessons',
      'Unlimited playground prompts',
      'Daily spaced repetition reviews',
      'Progress analytics',
    ],
    cta: 'Upgrade to Pro',
    highlighted: true,
  },
  {
    id: 'team',
    name: 'Team',
    price: '$16',
    period: '/seat/mo',
    features: [
      'Everything in Pro',
      'Team dashboard + analytics',
      'Invite links, org management',
      'Priority support',
    ],
    cta: 'Start Team trial',
  },
]

export function UpgradeModal({ open, onClose }: UpgradeModalProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const titleColor = useColorModeValue('#1A1A1A', '#F5F5F5')
  const defaultBorder = useColorModeValue('#E5E7EB', '#2D2D2D')
  const featureColor = useColorModeValue('#374151', '#D1D5DB')
  const priceSecColor = useColorModeValue('#6B7280', '#9CA3AF')
  const footerColor = useColorModeValue('#9CA3AF', '#6B7280')
  const secondaryBtnBg = useColorModeValue('#F3F4F6', '#252525')
  const secondaryBtnHoverBg = useColorModeValue('#E5E7EB', '#2D2D2D')
  const popularBg = useColorModeValue('#DBEAFE', '#1E3A5F')
  const highlightedPlanBg = useColorModeValue('#EFF6FF', '#0F1E38')

  async function handleUpgrade(plan: 'pro' | 'team') {
    setLoading(plan)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          successUrl: `${window.location.origin}/profile?upgraded=1`,
          cancelUrl: window.location.href,
        }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      // ignore
    } finally {
      setLoading(null)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Unlock everything"
      description="Get access to all tracks, unlimited playground, and spaced repetition."
    >
      <Box display="flex" flexDirection="column" gap={3} mt={4}>
        {PLANS.map(plan => (
          <Box
            key={plan.id}
            borderRadius="xl"
            border="2px solid"
            borderColor={plan.highlighted ? '#2563EB' : defaultBorder}
            px={4}
            py={3}
            bg={plan.highlighted ? highlightedPlanBg : 'transparent'}
          >
            <Flex alignItems="baseline" justifyContent="space-between" mb={2}>
              <Flex alignItems="center" gap={2}>
                <Text fontSize="16px" fontWeight="bold" color={titleColor}>{plan.name}</Text>
                {plan.highlighted && (
                  <Text
                    fontSize="11px"
                    fontWeight="600"
                    color="#2563EB"
                    bg={popularBg}
                    px={2}
                    py={0.5}
                    borderRadius="full"
                  >
                    Popular
                  </Text>
                )}
              </Flex>
              <Flex alignItems="baseline" gap={0.5}>
                <Text fontSize="18px" fontWeight="bold" color={titleColor}>{plan.price}</Text>
                {plan.period && (
                  <Text fontSize="12px" color={priceSecColor}>{plan.period}</Text>
                )}
              </Flex>
            </Flex>

            <Box as="ul" display="flex" flexDirection="column" gap={1} mb={3}>
              {plan.features.map((f, i) => (
                <Flex key={i} alignItems="flex-start" gap={2} fontSize="13px" color={featureColor}>
                  <Text color="#059669" mt={0.5} flexShrink={0}>✓</Text>
                  <Text>{f}</Text>
                </Flex>
              ))}
            </Box>

            {plan.cta && (
              <Box
                as="button"
                w="full"
                h="36px"
                borderRadius="lg"
                fontSize="14px"
                fontWeight="600"
                transition="background 0.15s"
                bg={plan.highlighted ? '#2563EB' : secondaryBtnBg}
                color={plan.highlighted ? 'white' : titleColor}
                _hover={{ bg: plan.highlighted ? '#1D4ED8' : secondaryBtnHoverBg }}
                opacity={loading !== null ? 0.5 : 1}
                pointerEvents={loading !== null ? 'none' : 'auto'}
                onClick={() => handleUpgrade(plan.id as 'pro' | 'team')}
                display="flex"
                alignItems="center"
                justifyContent="center"
                gap={2}
              >
                {loading === plan.id ? <><Spinner size="xs" /> Redirecting…</> : plan.cta}
              </Box>
            )}
          </Box>
        ))}
      </Box>

      <Text textAlign="center" fontSize="11px" color={footerColor} mt={4}>
        Cancel anytime. No hidden fees.
      </Text>
    </Modal>
  )
}
