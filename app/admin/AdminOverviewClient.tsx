'use client'

import { useState } from 'react'
import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import type { DailyEngagementPoint } from '@/lib/adminEngine'

interface Props {
  chart: DailyEngagementPoint[]
}

export function AdminOverviewClient({ chart }: Props) {
  const [metric, setMetric] = useState<'both' | 'dau' | 'lessons'>('both')
  const cardBg = useColorModeValue('#FFFFFF', '#1A1A1A')
  const cardBorder = useColorModeValue('#E5E7EB', '#2D2D2D')
  const pillBg = useColorModeValue('#F3F4F6', '#1C1C1C')
  const activePillBg = useColorModeValue('#FFFFFF', '#2A2A2A')
  const activePillText = useColorModeValue('#1A1A1A', '#F5F5F5')
  const mutedText = useColorModeValue('#9CA3AF', '#6B7280')

  return (
    <Box
      borderRadius="xl" border="1px solid" borderColor="border.default"
      bg="surface" p={4} display="flex" flexDirection="column" gap={3}
    >
      <Flex alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
        <Box>
          <Text fontSize="sm" fontWeight="semibold" color="text.primary">Engagement — last 30 days</Text>
          <Text fontSize="xs" color="text.secondary" mt="2px">Daily active users and lessons completed</Text>
        </Box>
        <Flex borderRadius="lg" bg={pillBg} p="2px" gap="2px">
          {(['both', 'dau', 'lessons'] as const).map(m => (
            <Box
              key={m}
              as="button"
              onClick={() => setMetric(m)}
              px="10px"
              py={1}
              borderRadius="md"
              fontSize="xs"
              fontWeight="medium"
              transition="colors 0.15s"
              bg={metric === m ? activePillBg : 'transparent'}
              color={metric === m ? activePillText : 'text.secondary'}
              boxShadow={metric === m ? 'sm' : 'none'}
            >
              {m === 'both' ? 'Both' : m === 'dau' ? 'DAU' : 'Lessons'}
            </Box>
          ))}
        </Flex>
      </Flex>

      {chart.length === 0 ? (
        <Flex h="192px" alignItems="center" justifyContent="center">
          <Text fontSize="sm" color={mutedText}>No data yet</Text>
        </Flex>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chart} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#9CA3AF' }}
              tickFormatter={d => d.slice(5)}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: cardBg,
                border: '1px solid ' + cardBorder,
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelFormatter={d => 'Date: ' + d}
            />
            {metric !== 'lessons' && (
              <Line type="monotone" dataKey="dau" name="DAU" stroke="#2563EB" strokeWidth={2} dot={false} />
            )}
            {metric !== 'dau' && (
              <Line type="monotone" dataKey="lessonsCompleted" name="Lessons" stroke="#10B981" strokeWidth={2} dot={false} />
            )}
            {metric === 'both' && <Legend wrapperStyle={{ fontSize: '11px' }} />}
          </LineChart>
        </ResponsiveContainer>
      )}
    </Box>
  )
}
