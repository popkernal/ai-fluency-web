import Link from 'next/link'
import { Box, Flex, Text } from '@chakra-ui/react'

export const metadata = { title: 'Library' }

const STREAMS = [
  {
    id: 'foundations',
    label: 'Foundations',
    tracks: [
      { id: 'foundations', title: 'AI Fundamentals',    desc: 'Understand how LLMs and generative AI actually work.',  hex: '#6366F1', lessons: 6,  locked: false },
      { id: 'prompting',   title: 'Prompt Engineering', desc: 'Write prompts that reliably produce great results.',     hex: '#0EA5E9', lessons: 8,  locked: false },
      { id: 'context',     title: 'Context & Memory',   desc: 'Learn how AI handles memory across conversations.',      hex: '#8B5CF6', lessons: 5,  locked: true  },
    ],
  },
  {
    id: 'application',
    label: 'Application',
    tracks: [
      { id: 'reasoning',  title: 'Reasoning & Logic',   desc: 'Get structured, logical outputs from AI models.',        hex: '#F59E0B', lessons: 6, locked: true },
      { id: 'coding',     title: 'AI-Assisted Coding',  desc: 'Accelerate your development with AI pair programming.',  hex: '#10B981', lessons: 7, locked: true },
      { id: 'writing',    title: 'Writing & Editing',   desc: 'Draft, refine, and polish content with AI.',             hex: '#EC4899', lessons: 6, locked: true },
      { id: 'data',       title: 'Data & Analysis',     desc: 'Extract insights and build data workflows with AI.',     hex: '#14B8A6', lessons: 6, locked: true },
      { id: 'multimodal', title: 'Multimodal AI',       desc: 'Work with images, audio, and vision models.',           hex: '#F97316', lessons: 5, locked: true },
    ],
  },
  {
    id: 'advanced',
    label: 'Advanced',
    tracks: [
      { id: 'agents',     title: 'AI Agents',           desc: 'Design and orchestrate autonomous AI workflows.',        hex: '#EF4444', lessons: 7, locked: true },
      { id: 'evaluation', title: 'Eval & Testing',      desc: 'Systematically measure and improve AI performance.',    hex: '#A855F7', lessons: 5, locked: true },
      { id: 'ethics',     title: 'Ethics & Safety',     desc: 'Build responsibly — understand risks and mitigations.', hex: '#84CC16', lessons: 5, locked: true },
      { id: 'advanced',   title: 'Advanced Topics',     desc: 'Fine-tuning, RLHF, and frontier research concepts.',    hex: '#06B6D4', lessons: 6, locked: true },
    ],
  },
]

interface Track {
  id: string
  title: string
  desc: string
  hex: string
  lessons: number
  locked: boolean
}

function TrackCard({ track }: { track: Track }) {
  return (
    <Box
      as={Link}
      href={track.locked ? '#' : '/learn'}
      aria-disabled={track.locked}
      display="flex"
      borderRadius="xl"
      overflow="hidden"
      border="1px solid"
      borderColor="border.default"
      bg="surface"
      opacity={track.locked ? 0.6 : 1}
      cursor={track.locked ? 'not-allowed' : 'pointer'}
      _hover={track.locked ? {} : { borderColor: '#D1D5DB', _dark: { borderColor: '#3D3D3D' } }}
      transition="border-color 0.15s"
      textDecoration="none"
    >
      {/* Left color strip */}
      <Box w="4px" flexShrink={0} style={{ backgroundColor: track.hex }} />

      <Flex flex={1} p={3} alignItems="flex-start" gap={3}>
        {/* Color dot */}
        <Box
          h={9}
          w={9}
          borderRadius="lg"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
          mt="2px"
          style={{ backgroundColor: track.hex + '22' }}
        >
          <Box h="10px" w="10px" borderRadius="full" style={{ backgroundColor: track.hex }} />
        </Box>

        <Box flex={1} minW={0}>
          <Flex alignItems="center" gap={2}>
            <Text fontSize="sm" fontWeight="semibold" color="text.primary" noOfLines={1}>{track.title}</Text>
            {track.locked && (
              <svg style={{ height: '14px', width: '14px', color: '#9CA3AF', flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            )}
          </Flex>
          <Text fontSize="xs" color="text.secondary" mt="2px" noOfLines={2} lineHeight="snug">{track.desc}</Text>
          <Text fontSize="10px" fontWeight="medium" color="text.secondary" mt={1}>{track.lessons} lessons</Text>
        </Box>
      </Flex>
    </Box>
  )
}

export default function LibraryPage() {
  return (
    <Box mx="-16px" mt="-24px">
      {/* Header */}
      <Box px={4} pt={5} pb={4} bg="bg">
        <Box maxW="720px" mx="auto">
          <Text fontSize="22px" fontWeight="bold" color="text.primary">Library</Text>
          <Text fontSize="sm" color="text.secondary" mt="2px">
            12 tracks · 71 lessons · all levels
          </Text>
        </Box>
      </Box>

      {/* Track streams */}
      <Box px={4} pb={8} maxW="720px" mx="auto" display="flex" flexDirection="column" gap={6}>
        {STREAMS.map(stream => (
          <Box as="section" key={stream.id}>
            <Text
              fontSize="xs"
              fontWeight="semibold"
              textTransform="uppercase"
              letterSpacing="widest"
              color="text.secondary"
              mb={3}
            >
              {stream.label}
            </Text>
            <Box display="flex" flexDirection="column" gap={2}>
              {stream.tracks.map(track => (
                <TrackCard key={track.id} track={track} />
              ))}
            </Box>
          </Box>
        ))}

        {/* Unlock hint */}
        <Box
          borderRadius="xl"
          border="1px dashed"
          borderColor="border.default"
          p={5}
          textAlign="center"
        >
          <Text fontSize="sm" fontWeight="medium" color="text.primary" mb={1}>Unlock more tracks</Text>
          <Text fontSize="xs" color="text.secondary">
            Complete earlier tracks to unlock advanced content. Start with{' '}
            <Box as={Link} href="/learn" color="#E8601C" _hover={{ textDecoration: 'underline' }} fontWeight="medium">
              Prompt Engineering
            </Box>.
          </Text>
        </Box>
      </Box>
    </Box>
  )
}
