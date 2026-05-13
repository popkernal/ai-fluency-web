import { Box, Text } from '@chakra-ui/react'
import { getAdminUsers } from '@/lib/adminEngine'
import { UsersTableClient } from './UsersTableClient'

export const metadata = { title: 'Admin — Users' }
export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ q?: string }>
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const { q } = await searchParams
  const users = await getAdminUsers(q)

  return (
    <Box display="flex" flexDirection="column" gap={4} maxW="6xl">
      <Box>
        <Text fontSize="22px" fontWeight="bold" color="text.primary">Users</Text>
        <Text fontSize="sm" color="text.secondary" mt={1}>
          {users.length} user{users.length !== 1 ? 's' : ''}{q ? ' matching "' + q + '"' : ''}
        </Text>
      </Box>
      <UsersTableClient users={users} initialSearch={q ?? ''} />
    </Box>
  )
}
