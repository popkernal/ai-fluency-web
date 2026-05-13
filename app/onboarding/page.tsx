'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react'
import { completeOnboarding } from './actions'
import type { QuizAnswers } from '@/lib/difficultyEngine'

const MOTIVATIONS = [
  { id: 'productivity', emoji: '⚡', label: 'Be more productive at work' },
  { id: 'career',       emoji: '🚀', label: 'Career advancement' },
  { id: 'keep-up',      emoji: '📡', label: 'Keep up with industry changes' },
  { id: 'build-tools',  emoji: '🛠', label: 'Build AI-powered tools or workflows' },
  { id: 'lead',         emoji: '🎯', label: 'Lead AI initiatives on my team' },
  { id: 'curiosity',    emoji: '🔍', label: 'Personal curiosity' },
  { id: 'other',        emoji: '💡', label: 'Other' },
]

const GOALS = [
  { id: 'prompts',   emoji: '✍️', label: 'Write effective prompts' },
  { id: 'projects',  emoji: '⚙️', label: 'Set up AI projects and workflows' },
  { id: 'confident', emoji: '🤝', label: 'Use Claude or ChatGPT confidently' },
  { id: 'automate',  emoji: '🔄', label: 'Automate repetitive tasks' },
  { id: 'custom',    emoji: '🧩', label: 'Build custom AI tools' },
  { id: 'team',      emoji: '👥', label: 'Train my team on AI' },
  { id: 'concepts',  emoji: '🧠', label: 'Understand AI concepts and limitations' },
  { id: 'strategy',  emoji: '📊', label: 'Navigate AI strategy decisions' },
]

const EXPERIENCE_LEVELS = [
  { id: 0, label: 'None',    desc: "You're about to send your first AI prompt" },
  { id: 1, label: 'A little', desc: "You've used ChatGPT or Claude a few times" },
  { id: 2, label: 'A lot',   desc: 'You use AI tools regularly for work' },
]

const INTEREST_AREAS = [
  {
    id: 'foundations',
    emoji: '📝',
    title: 'Prompting & Fundamentals',
    desc: 'Learn how AI works and write precise prompts',
    bullets: ['Prompt engineering', 'Context & memory', 'Avoiding common mistakes'],
    gradient: 'linear-gradient(135deg, #0EA5E9 0%, #0369A1 100%)',
  },
  {
    id: 'application',
    emoji: '💻',
    title: 'Claude & Workflow Deep Dive',
    desc: 'Set up projects, build workflows with AI tools',
    bullets: ['Claude Projects setup', 'Agentic workflows', 'Skills & MCPs'],
    gradient: 'linear-gradient(135deg, #10B981 0%, #065F46 100%)',
  },
  {
    id: 'advanced',
    emoji: '🤖',
    title: 'Advanced AI & Agents',
    desc: 'AI agents, automation pipelines, and team strategy',
    bullets: ['AI agent design', 'Eval & testing', 'Team-level AI strategy'],
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #5B21B6 100%)',
  },
]

const TIME_OPTIONS = [
  { id: 'casual',  label: 'Casual',  mins: '5 min' },
  { id: 'regular', label: 'Regular', mins: '10 min', recommended: true },
  { id: 'serious', label: 'Serious', mins: '20 min' },
]

const TOTAL_QUIZ_STEPS = 5

interface OnboardingState {
  motivations: string[]
  goals: string[]
  experience: number
  interests: string[]
  timeCommitment: string
}

const variants = {
  enter:  (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit:   (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [state, setState] = useState<OnboardingState>({
    motivations: [],
    goals: [],
    experience: 0,
    interests: [],
    timeCommitment: 'regular',
  })
  const [onboardingResult, setOnboardingResult] = useState<{ skillLevel: string; recommendedTrack: string } | null>(null)
  const completedRef = useRef(false)

  const pageBg = useColorModeValue('#FFFFFF', '#0F0F0F')
  const progressTrackBg = useColorModeValue('#F3F4F6', '#2D2D2D')
  const borderColor = useColorModeValue('#F3F4F6', '#1A1A1A')

  function goNext() {
    setDirection(1)
    setStep(s => s + 1)
  }

  function goBack() {
    setDirection(-1)
    setStep(s => Math.max(s - 1, 0))
  }

  function toggleMulti(key: 'motivations' | 'goals' | 'interests', id: string, max?: number) {
    setState(prev => {
      const arr = prev[key] as string[]
      const exists = arr.includes(id)
      if (exists) return { ...prev, [key]: arr.filter(x => x !== id) }
      if (max && arr.length >= max) return prev
      return { ...prev, [key]: [...arr, id] }
    })
  }

  useEffect(() => {
    if (step === 6 && !completedRef.current) {
      completedRef.current = true
      const quizAnswers: QuizAnswers = {
        q1_familiarity: state.experience as 0 | 1 | 2,
        q2_goal: (state.goals.length > 0 ? (state.goals.includes('build-tools') || state.goals.includes('custom') ? 2 : state.goals.includes('prompts') ? 1 : 0) : 0) as 0 | 1 | 2,
        q3_experience: (state.motivations.includes('build-tools') || state.motivations.includes('lead') ? 2 : state.motivations.includes('career') || state.motivations.includes('keep-up') ? 1 : 0) as 0 | 1 | 2,
      }
      completeOnboarding(quizAnswers)
        .then(result => { setOnboardingResult(result) })
        .catch(() => {})
        .finally(() => { setTimeout(() => setStep(7), 2200) })
    }
  }, [step, state])

  const canProceed = (() => {
    if (step === 1) return state.motivations.length > 0
    if (step === 2) return state.goals.length > 0
    if (step === 3) return true
    if (step === 4) return state.interests.length > 0
    if (step === 5) return state.timeCommitment !== ''
    return true
  })()

  const progressPct = step >= 1 && step <= TOTAL_QUIZ_STEPS
    ? ((step - 1) / (TOTAL_QUIZ_STEPS - 1)) * 100
    : step > TOTAL_QUIZ_STEPS ? 100 : 0

  const showProgress = step >= 1 && step <= TOTAL_QUIZ_STEPS
  const showBack = step >= 1 && step <= TOTAL_QUIZ_STEPS
  const showCta = step >= 1 && step <= TOTAL_QUIZ_STEPS

  return (
    <Box position="fixed" inset={0} bg={pageBg} display="flex" flexDirection="column" zIndex={50}>
      {/* Progress bar */}
      <Box h={1} w="full" bg={progressTrackBg} flexShrink={0}>
        <Box
          h="full"
          bg="#E8601C"
          borderRadius="full"
          transition="width 0.4s"
          style={{ width: showProgress ? `${progressPct}%` : step === 0 ? '0%' : '100%' }}
        />
      </Box>

      {/* Back arrow */}
      <Box display="flex" alignItems="center" px={5} pt={3} pb={1} flexShrink={0} minH="44px">
        {showBack && step > 1 ? (
          <Box
            as="button"
            p={1}
            ml="-4px"
            color="#6B7280"
            _hover={{ color: '#1A1A1A' }}
            transition="colors 0.15s"
            onClick={goBack}
            aria-label="Go back"
          >
            <svg style={{ height: '24px', width: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Box>
        ) : <Box />}
      </Box>

      {/* Scrollable content */}
      <Box flex={1} overflowY="auto" overflowX="hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            style={{ minHeight: '100%', padding: '0 20px 24px' }}
          >
            {step === 0 && <Splash onStart={goNext} />}
            {step === 1 && <StepMotivations selected={state.motivations} onToggle={id => toggleMulti('motivations', id)} />}
            {step === 2 && <StepGoals selected={state.goals} onToggle={id => toggleMulti('goals', id, 3)} />}
            {step === 3 && <StepExperience value={state.experience} onChange={v => setState(prev => ({ ...prev, experience: v }))} />}
            {step === 4 && <StepInterests selected={state.interests} onToggle={id => toggleMulti('interests', id, 3)} />}
            {step === 5 && <StepTimeCommitment selected={state.timeCommitment} onSelect={v => setState(prev => ({ ...prev, timeCommitment: v }))} />}
            {step === 6 && <StepLoading />}
            {step === 7 && <StepRecommendation state={state} onboardingResult={onboardingResult} />}
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Pinned CTA */}
      {showCta && (
        <Box
          px={5}
          pt={3}
          pb="20px"
          bg={pageBg}
          borderTop="1px solid"
          borderColor={borderColor}
          flexShrink={0}
        >
          <Box
            as="button"
            onClick={goNext}
            disabled={!canProceed}
            w="full"
            h={14}
            borderRadius="2xl"
            fontSize="16px"
            fontWeight="semibold"
            transition="all 0.15s"
            bg={canProceed ? '#E8601C' : '#F3F4F6'}
            color={canProceed ? 'white' : '#9CA3AF'}
            cursor={canProceed ? 'pointer' : 'not-allowed'}
            _hover={{ bg: canProceed ? '#D4521A' : '#F3F4F6' }}
          >
            {step === 5 ? 'Build my learning path' : 'Continue'}
          </Box>
        </Box>
      )}
    </Box>
  )
}

function Splash({ onStart }: { onStart: () => void }) {
  const primaryColor = useColorModeValue('#1A1A1A', '#F5F5F5')
  const secondaryColor = useColorModeValue('#6B7280', '#9CA3AF')
  const dotBg = useColorModeValue('#E5E7EB', '#2D2D2D')

  return (
    <Flex flexDirection="column" alignItems="center" justifyContent="space-between" minH="calc(100vh - 3rem)" py={10} textAlign="center">
      <Flex flex={1} flexDirection="column" alignItems="center" justifyContent="center" gap={6}>
        <Text fontSize="96px" lineHeight={1} userSelect="none">🤖</Text>
        <Flex gap="6px">
          <Box h={2} w={6} borderRadius="full" bg="#E8601C" />
          <Box h={2} w={2} borderRadius="full" bg={dotBg} />
          <Box h={2} w={2} borderRadius="full" bg={dotBg} />
        </Flex>
      </Flex>

      <Box mb={8} display="flex" flexDirection="column" gap={3}>
        <Text fontSize="28px" fontWeight="bold" color={primaryColor} lineHeight="tight">
          Learn AI fluency
        </Text>
        <Text fontSize="15px" color={secondaryColor} maxW="xs" mx="auto" lineHeight="relaxed">
          Master the skills to use AI confidently &mdash; at work, for projects, and beyond.
        </Text>
      </Box>

      <Box w="full" display="flex" flexDirection="column" gap={3}>
        <Box
          as="button"
          onClick={onStart}
          w="full"
          h={14}
          borderRadius="2xl"
          bg="#E8601C"
          color="white"
          fontSize="16px"
          fontWeight="semibold"
          _hover={{ bg: '#D4521A' }}
          transition="colors 0.15s"
        >
          Get started
        </Box>
        <Box
          as={Link}
          href="/login"
          display="block"
          w="full"
          textAlign="center"
          py={3}
          fontSize="15px"
          color={secondaryColor}
          _hover={{ color: '#E8601C' }}
          transition="colors 0.15s"
        >
          I already have an account
        </Box>
      </Box>
    </Flex>
  )
}

function OptionCard({
  emoji, label, checked, onToggle, disabled = false,
}: {
  emoji: string; label: string; checked: boolean; onToggle: () => void; disabled?: boolean
}) {
  const primaryColor = useColorModeValue('#1A1A1A', '#F5F5F5')
  const cardBg = useColorModeValue('#FFFFFF', '#1A1A1A')
  const cardBorder = useColorModeValue('#E5E7EB', '#2D2D2D')
  const cardHoverBorder = useColorModeValue('#D1D5DB', '#3D3D3D')
  const checkedCardBg = useColorModeValue('#FEF0E8', '#2D1A10')

  return (
    <Box
      as="button"
      onClick={onToggle}
      disabled={disabled}
      w="full"
      display="flex"
      alignItems="center"
      gap={3}
      borderRadius="xl"
      border="2px solid"
      px={4}
      py="14px"
      textAlign="left"
      transition="all 0.15s"
      borderColor={checked ? '#E8601C' : cardBorder}
      bg={checked ? checkedCardBg : cardBg}
      _hover={{ borderColor: checked ? '#E8601C' : cardHoverBorder }}
      _disabled={{ opacity: 0.4, cursor: 'not-allowed' }}
    >
      <Text fontSize="xl" lineHeight={1} flexShrink={0}>{emoji}</Text>
      <Text
        flex={1}
        fontSize="15px"
        lineHeight="snug"
        fontWeight={checked ? 'semibold' : 'medium'}
        color={checked ? '#E8601C' : primaryColor}
      >
        {label}
      </Text>
      {checked && (
        <Box
          h={5}
          w={5}
          borderRadius="full"
          bg="#E8601C"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          <svg style={{ height: '12px', width: '12px', color: 'white' }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </Box>
      )}
    </Box>
  )
}

function StepHeader({ emoji, heading, sub }: { emoji: string; heading: string; sub: string }) {
  const primaryColor = useColorModeValue('#1A1A1A', '#F5F5F5')
  const secondaryColor = useColorModeValue('#6B7280', '#9CA3AF')
  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <Text fontSize="56px" lineHeight={1} mb={3} userSelect="none">{emoji}</Text>
      <Text fontSize="24px" fontWeight="bold" color={primaryColor} lineHeight="tight">{heading}</Text>
      <Text fontSize="15px" color={secondaryColor}>{sub}</Text>
    </Box>
  )
}

function StepMotivations({ selected, onToggle }: { selected: string[]; onToggle: (id: string) => void }) {
  const secondaryColor = useColorModeValue('#6B7280', '#9CA3AF')
  return (
    <Box display="flex" flexDirection="column" gap={5} pt={2}>
      <StepHeader emoji="🎯" heading="Why do you want to learn AI?" sub="Select as many as you'd like." />
      <Box display="flex" flexDirection="column" gap={2}>
        {MOTIVATIONS.map(opt => (
          <OptionCard key={opt.id} emoji={opt.emoji} label={opt.label} checked={selected.includes(opt.id)} onToggle={() => onToggle(opt.id)} />
        ))}
        <Box as="button" w="full" textAlign="center" py={3} fontSize="15px" color={secondaryColor} _hover={{ color: '#E8601C' }} transition="colors 0.15s">
          None of these
        </Box>
      </Box>
    </Box>
  )
}

function StepGoals({ selected, onToggle }: { selected: string[]; onToggle: (id: string) => void }) {
  return (
    <Box display="flex" flexDirection="column" gap={5} pt={2}>
      <StepHeader emoji="🏁" heading="What would you like to do with AI?" sub="Pick up to 3." />
      <Box display="flex" flexDirection="column" gap={2}>
        {GOALS.map(opt => {
          const maxReached = selected.length >= 3 && !selected.includes(opt.id)
          return (
            <OptionCard
              key={opt.id}
              emoji={opt.emoji}
              label={opt.label}
              checked={selected.includes(opt.id)}
              onToggle={() => onToggle(opt.id)}
              disabled={maxReached}
            />
          )
        })}
      </Box>
    </Box>
  )
}

function StepExperience({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const current = EXPERIENCE_LEVELS[value]
  const primaryColor = useColorModeValue('#1A1A1A', '#F5F5F5')
  const secondaryColor = useColorModeValue('#6B7280', '#9CA3AF')
  const trackBg = useColorModeValue('#E5E7EB', '#2D2D2D')

  return (
    <Box display="flex" flexDirection="column" gap={8} pt={2}>
      <StepHeader emoji="📏" heading="How much AI experience do you have?" sub="Be honest — we'll calibrate your lessons." />
      <Box display="flex" flexDirection="column" gap={6}>
        <Box px={2}>
          <Flex justifyContent="space-between" mb={3}>
            {EXPERIENCE_LEVELS.map(level => (
              <Text
                key={level.id}
                fontSize="xs"
                fontWeight="semibold"
                textTransform="uppercase"
                letterSpacing="wide"
                color={value === level.id ? '#E8601C' : secondaryColor}
              >
                {level.label}
              </Text>
            ))}
          </Flex>
          <Box
            as="input"
            type="range"
            min={0}
            max={2}
            step={1}
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(Number(e.target.value))}
            w="full"
            h={2}
            borderRadius="full"
            appearance="none"
            cursor="pointer"
            style={{
              background: `linear-gradient(to right, #E8601C ${value * 50}%, #E5E7EB ${value * 50}%)`,
            }}
            sx={{
              '&::-webkit-slider-thumb': {
                appearance: 'none',
                height: '24px',
                width: '24px',
                borderRadius: '50%',
                backgroundColor: '#E8601C',
                border: '2px solid white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                cursor: 'pointer',
              },
              '&::-moz-range-thumb': {
                height: '24px',
                width: '24px',
                borderRadius: '50%',
                backgroundColor: '#E8601C',
                border: '2px solid white',
                cursor: 'pointer',
              },
            }}
          />
        </Box>
        <motion.div
          key={value}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          style={{ textAlign: 'center' }}
        >
          <Text fontSize="15px" color={secondaryColor}>{current.desc}</Text>
        </motion.div>
      </Box>
    </Box>
  )
}

function StepInterests({ selected, onToggle }: { selected: string[]; onToggle: (id: string) => void }) {
  const primaryColor = useColorModeValue('#1A1A1A', '#F5F5F5')
  const secondaryColor = useColorModeValue('#6B7280', '#9CA3AF')
  const cardBg = useColorModeValue('#FFFFFF', '#1A1A1A')
  const unselectedBorder = useColorModeValue('#E5E7EB', '#2D2D2D')
  const overviewBg = useColorModeValue('#F9FAFB', '#161616')
  const overviewBorder = useColorModeValue('#E5E7EB', '#2D2D2D')
  const pillBg = useColorModeValue('#F3F4F6', '#2D2D2D')
  const pillColor = useColorModeValue('#374151', '#D1D5DB')

  return (
    <Box display="flex" flexDirection="column" gap={5} pt={2}>
      {/* Header */}
      <Box>
        <Text fontSize="24px" fontWeight="bold" color={primaryColor} lineHeight="tight" mb={1}>
          Pick your first track
        </Text>
        <Text fontSize="15px" color={secondaryColor}>You can always switch or add more later.</Text>
      </Box>

      {/* How it works */}
      <Box borderRadius="xl" border="1px solid" borderColor={overviewBorder} bg={overviewBg} p={4} display="flex" flexDirection="column" gap={3}>
        <Text fontSize="12px" fontWeight="bold" textTransform="uppercase" letterSpacing="widest" color={secondaryColor}>
          How AI Fluency works
        </Text>
        <Flex gap={3}>
          {[
            { icon: '📖', label: 'Bite-sized lessons', desc: '5–10 min each' },
            { icon: '✍️', label: 'Hands-on exercises', desc: 'AI grades your work' },
            { icon: '🔁', label: 'Daily review', desc: 'Spaced repetition' },
          ].map(item => (
            <Box key={item.label} flex={1} display="flex" flexDirection="column" alignItems="center" textAlign="center" gap={1}>
              <Text fontSize="22px" lineHeight={1}>{item.icon}</Text>
              <Text fontSize="11px" fontWeight="semibold" color={primaryColor} lineHeight="snug">{item.label}</Text>
              <Text fontSize="11px" color={secondaryColor}>{item.desc}</Text>
            </Box>
          ))}
        </Flex>
      </Box>

      {/* Track cards — compact horizontal layout */}
      <Box display="flex" flexDirection="column" gap={2}>
        {INTEREST_AREAS.map(area => {
          const isSelected = selected.includes(area.id)
          const maxReached = selected.length >= 3 && !isSelected
          return (
            <Box
              key={area.id}
              as="button"
              onClick={() => !maxReached && onToggle(area.id)}
              disabled={maxReached}
              textAlign="left"
              borderRadius="xl"
              overflow="hidden"
              border="2px solid"
              borderColor={isSelected ? '#E8601C' : unselectedBorder}
              bg={cardBg}
              transition="all 0.15s"
              opacity={maxReached ? 0.5 : 1}
              cursor={maxReached ? 'not-allowed' : 'pointer'}
              display="flex"
              alignItems="stretch"
            >
              {/* Color bar + emoji */}
              <Box
                w="56px"
                flexShrink={0}
                display="flex"
                alignItems="center"
                justifyContent="center"
                style={{ background: area.gradient }}
              >
                <Text fontSize="22px" lineHeight={1}>{area.emoji}</Text>
              </Box>

              {/* Content */}
              <Box flex={1} px={3} py="12px" display="flex" flexDirection="column" gap="4px}>
                <Text fontSize="14px" fontWeight="semibold" color={isSelected ? '#E8601C' : primaryColor} lineHeight="snug">
                  {area.title}
                </Text>
                <Text fontSize="12px" color={secondaryColor} lineHeight="snug">{area.desc}</Text>
                <Flex gap="4px" mt={1} flexWrap="wrap">
                  {area.bullets.map(b => (
                    <Box key={b} px="6px" py="2px" borderRadius="full" bg={pillBg} fontSize="10px" color={pillColor}>
                      {b}
                    </Box>
                  ))}
                </Flex>
              </Box>

              {/* Checkmark */}
              <Box w="40px" flexShrink={0} display="flex" alignItems="center" justifyContent="center">
                {isSelected ? (
                  <Box h={5} w={5} borderRadius="full" bg="#E8601C" display="flex" alignItems="center" justifyContent="center">
                    <svg style={{ height: '11px', width: '11px', color: 'white' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </Box>
                ) : (
                  <Box h={5} w={5} borderRadius="full" border="2px solid" borderColor={unselectedBorder} />
                )}
              </Box>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

function StepTimeCommitment({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  const primaryColor = useColorModeValue('#1A1A1A', '#F5F5F5')
  const secondaryColor = useColorModeValue('#6B7280', '#9CA3AF')
  const cardBg = useColorModeValue('#FFFFFF', '#1A1A1A')
  const cardBorder = useColorModeValue('#E5E7EB', '#2D2D2D')
  const cardHoverBorder = useColorModeValue('#D1D5DB', '#3D3D3D')
  const selectedCardBg = useColorModeValue('#FEF0E8', '#2D1A10')

  return (
    <Box display="flex" flexDirection="column" gap={5} pt={2}>
      <StepHeader emoji="⏱" heading="How much time do you want to spend learning?" sub="You can always change this goal later." />
      <Box display="flex" flexDirection="column" gap={2}>
        {TIME_OPTIONS.map(opt => {
          const isSelected = selected === opt.id
          return (
            <Box
              key={opt.id}
              as="button"
              onClick={() => onSelect(opt.id)}
              w="full"
              display="flex"
              alignItems="center"
              gap={4}
              borderRadius="xl"
              border="2px solid"
              px={4}
              py={4}
              transition="all 0.15s"
              borderColor={isSelected ? '#E8601C' : cardBorder}
              bg={isSelected ? selectedCardBg : cardBg}
              _hover={{ borderColor: isSelected ? '#E8601C' : cardHoverBorder }}
            >
              <Box
                h={5}
                w={5}
                borderRadius="full"
                border="2px solid"
                borderColor={isSelected ? '#E8601C' : cardHoverBorder}
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
                transition="colors 0.15s"
              >
                {isSelected && <Box h="10px" w="10px" borderRadius="full" bg="#E8601C" />}
              </Box>

              <Flex alignItems="center" gap={2} flex={1}>
                <Text
                  fontSize="15px"
                  fontWeight={isSelected ? 'semibold' : 'medium'}
                  color={isSelected ? '#E8601C' : primaryColor}
                >
                  {opt.label}
                </Text>
                {opt.recommended && (
                  <Box
                    fontSize="10px"
                    fontWeight="bold"
                    px={2}
                    py="2px"
                    bg="#E8601C"
                    color="white"
                    borderRadius="full"
                    textTransform="uppercase"
                    letterSpacing="wide"
                  >
                    Recommended
                  </Box>
                )}
              </Flex>

              <Text fontSize="sm" fontWeight="medium" color={secondaryColor} sx={{ fontVariantNumeric: "tabular-nums" }}>
                {opt.mins}
              </Text>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

function StepLoading() {
  const primaryColor = useColorModeValue('#1A1A1A', '#F5F5F5')
  const secondaryColor = useColorModeValue('#6B7280', '#9CA3AF')
  const iconBg = useColorModeValue('#F0FDF4', '#0A2010')
  const checklistColor = useColorModeValue('#374151', '#D1D5DB')

  return (
    <Flex flexDirection="column" alignItems="center" justifyContent="center" minH="60vh" gap={8} textAlign="center">
      <Box position="relative" h={20} w={20}>
        <svg style={{ animation: 'spin 2s linear infinite', height: '80px', width: '80px', color: '#E8601C' }} viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="5" strokeOpacity="0.15" />
          <path d="M40 6a34 34 0 0134 34" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        </svg>
        <Box position="absolute" inset={0} display="flex" alignItems="center" justifyContent="center" fontSize="30px">🤖</Box>
      </Box>

      <Box>
        <Text fontSize="22px" fontWeight="bold" color={primaryColor} mb={2}>
          Building your learning path…
        </Text>
        <Text fontSize="15px" color={secondaryColor}>Personalizing your curriculum</Text>
      </Box>

      <Box display="flex" flexDirection="column" gap={3} w="full" maxW="xs">
        {['Analysing your goals', 'Selecting tracks', 'Scheduling your lessons'].map((label, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.5, duration: 0.3 }}
          >
            <Flex alignItems="center" gap={3} fontSize="15px" color={checklistColor}>
              <Box h={6} w={6} borderRadius="full" bg={iconBg} display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
                <svg style={{ height: '14px', width: '14px', color: '#059669' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </Box>
              {label}
            </Flex>
          </motion.div>
        ))}
      </Box>
    </Flex>
  )
}

const TRACK_MAP: Record<string, { title: string; desc: string; gradient: string; emoji: string; lessons: number; bullets: string[] }> = {
  foundations: {
    title: 'Prompt Engineering',
    desc: 'Master the fundamentals of writing precise, effective prompts that get reliable results from any AI model.',
    gradient: 'linear-gradient(135deg, #0EA5E9 0%, #0369A1 100%)',
    emoji: '📝',
    lessons: 8,
    bullets: ['Writing precise instructions', 'Context windows', 'Temperature & randomness'],
  },
  application: {
    title: 'AI-Assisted Coding',
    desc: 'Use Claude and Cursor for real development work — code reviews, debugging, and building faster.',
    gradient: 'linear-gradient(135deg, #10B981 0%, #065F46 100%)',
    emoji: '💻',
    lessons: 7,
    bullets: ['AI pair programming', 'Code explanation & review', 'Debugging with AI'],
  },
  advanced: {
    title: 'AI Agents',
    desc: 'Design and build autonomous AI agents that complete multi-step tasks with minimal supervision.',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #5B21B6 100%)',
    emoji: '🤖',
    lessons: 7,
    bullets: ['Agent design patterns', 'Tool use & orchestration', 'Eval & testing'],
  },
}

function Chip({ label }: { label: string }) {
  const chipBg = useColorModeValue('#F3F4F6', '#2D2D2D')
  const chipColor = useColorModeValue('#374151', '#D1D5DB')
  return (
    <Box px={3} py={1} borderRadius="full" fontSize="13px" bg={chipBg} color={chipColor}>
      {label}
    </Box>
  )
}

function StepRecommendation({
  state,
  onboardingResult,
}: {
  state: OnboardingState
  onboardingResult: { skillLevel: string; recommendedTrack: string } | null
}) {
  const primaryColor = useColorModeValue('#1A1A1A', '#F5F5F5')
  const secondaryColor = useColorModeValue('#6B7280', '#9CA3AF')
  const chipSectionBg = useColorModeValue('#FFFFFF', '#1A1A1A')
  const chipSectionBorder = useColorModeValue('#E5E7EB', '#2D2D2D')
  const chipLabelColor = useColorModeValue('#9CA3AF', '#6B7280')

  const key = onboardingResult?.recommendedTrack ?? state.interests[0] ?? 'foundations'
  const track = TRACK_MAP[key] ?? TRACK_MAP.foundations

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box display="flex" flexDirection="column" gap={5} pt={2} pb={8}>
        <Box>
          <Text fontSize="sm" fontWeight="semibold" color="#E8601C" mb={1}>Your learning path is ready ✓</Text>
          <Text fontSize="26px" fontWeight="bold" color={primaryColor} lineHeight="tight">
            We recommend starting here
          </Text>
        </Box>

        <Box borderRadius="2xl" overflow="hidden" style={{ background: track.gradient }}>
          <Box p={5}>
            <Text fontSize="11px" fontWeight="bold" color="whiteAlpha.700" textTransform="uppercase" letterSpacing="widest" mb={2}>
              Recommended track
            </Text>
            <Text fontSize="30px" mb={2}>{track.emoji}</Text>
            <Text fontSize="22px" fontWeight="bold" color="white" mb={2} lineHeight="tight">{track.title}</Text>
            <Text fontSize="14px" color="whiteAlpha.800" mb={4} lineHeight="relaxed">{track.desc}</Text>
            <Box as="ul" display="flex" flexDirection="column" gap="6px" mb={4} listStyleType="none">
              {track.bullets.map(b => (
                <Flex key={b} alignItems="center" gap={2} fontSize="13px" color="whiteAlpha.900">
                  <svg style={{ height: '14px', width: '14px', color: 'rgba(255,255,255,0.7)', flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {b}
                </Flex>
              ))}
            </Box>
            <Flex alignItems="center" gap={3} fontSize="13px" color="whiteAlpha.600">
              <Text>{track.lessons} lessons</Text>
              <Text>&middot;</Text>
              <Text>~{track.lessons * 5} min total</Text>
            </Flex>
          </Box>
        </Box>

        <Box display="flex" flexDirection="column" gap={3}>
          <Box
            as="a"
            href="/learn"
            display="flex"
            alignItems="center"
            justifyContent="center"
            w="full"
            h={14}
            borderRadius="2xl"
            bg="#E8601C"
            color="white"
            fontSize="16px"
            fontWeight="semibold"
            _hover={{ bg: '#D4521A' }}
            transition="colors 0.15s"
          >
            Enroll &amp; Start Learning
          </Box>
          <Box
            as="a"
            href="/library"
            display="block"
            w="full"
            textAlign="center"
            py={3}
            fontSize="15px"
            color={secondaryColor}
            _hover={{ color: '#E8601C' }}
            transition="colors 0.15s"
          >
            Browse all tracks
          </Box>
        </Box>

        <Box borderRadius="xl" border="1px solid" borderColor={chipSectionBorder} bg={chipSectionBg} p={4}>
          <Text fontSize="11px" fontWeight="semibold" textTransform="uppercase" letterSpacing="widest" color={chipLabelColor} mb={2}>
            Your profile
          </Text>
          <Flex flexWrap="wrap" gap="6px">
            <Chip label={EXPERIENCE_LEVELS[state.experience]?.label ?? 'Beginner'} />
            <Chip label={TIME_OPTIONS.find(t => t.id === state.timeCommitment)?.mins ?? '10 min'} />
            {state.goals.slice(0, 2).map(g => (
              <Chip key={g} label={GOALS.find(x => x.id === g)?.label ?? g} />
            ))}
          </Flex>
        </Box>
      </Box>
    </motion.div>
  )
}
