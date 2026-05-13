import Link from 'next/link'
import { Box, Flex, Text } from '@chakra-ui/react'

const NAV = [
  { href: '/admin',         label: 'Overview'  },
  { href: '/admin/content', label: 'Content'   },
  { href: '/admin/users',   label: 'Users'     },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box minH="100vh" display="flex" flexDirection={{ base: 'column', lg: 'row' }}>
      {/* Sidebar */}
      <Box
        as="aside"
        w={{ lg: '208px' }}
        flexShrink={0}
        borderBottom={{ base: '1px solid', lg: 'none' }}
        borderRight={{ lg: '1px solid' }}
        borderColor="border.default"
        bg="surface"
      >
        <Box p={4} borderBottom="1px solid" borderColor="border.default">
          <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" color="text.secondary">
            Admin
          </Text>
        </Box>
        <Box as="nav" p={2}>
          {NAV.map(item => (
            <Box
              key={item.href}
              as={Link}
              href={item.href}
              display="flex"
              alignItems="center"
              px={3}
              py={2}
              borderRadius="lg"
              fontSize="sm"
              fontWeight="medium"
              color="text.secondary"
              _hover={{ bg: 'rgba(0,0,0,0.04)', color: 'text.primary', _dark: { bg: 'rgba(255,255,255,0.04)' } }}
              transition="colors 0.15s"
            >
              {item.label}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Main */}
      <Box as="main" flex={1} p={{ base: 4, lg: 6 }} minW={0}>
        {children}
      </Box>
    </Box>
  )
}
