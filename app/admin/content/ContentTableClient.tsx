'use client'

import { useState } from 'react'
import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react'
import type { LessonAnalyticsRow } from '@/lib/adminEngine'

type SortKey = keyof Omit<LessonAnalyticsRow, 'flagged'>
type SortDir = 'asc' | 'desc'

interface Props {
  rows: LessonAnalyticsRow[]
}

export function ContentTableClient({ rows }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('completionRate')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null)
  const [drillData, setDrillData] = useState<Record<string, ExerciseRow[]>>({})
  const [drillLoading, setDrillLoading] = useState(false)

  const tableBorder = useColorModeValue('#E5E7EB', '#2D2D2D')
  const theadBg = useColorModeValue('#F9FAFB', '#1C1C1C')
  const rowHoverBg = useColorModeValue('#F9FAFB', '#1C1C1C')
  const flaggedRowBg = useColorModeValue('rgba(254,242,242,0.4)', 'rgba(127,29,29,0.1)')
  const drillRowBg = useColorModeValue('#F9FAFB', '#141414')
  const primaryText = useColorModeValue('#1A1A1A', '#F5F5F5')
  const secondaryText = useColorModeValue('#6B7280', '#9CA3AF')
  const mutedText = useColorModeValue('#9CA3AF', '#6B7280')
  const monoText = useColorModeValue('#374151', '#D1D5DB')

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sorted = [...rows].sort((a, b) => {
    const av = a[sortKey] ?? -Infinity
    const bv = b[sortKey] ?? -Infinity
    const cmp = (av as number) < (bv as number) ? -1 : (av as number) > (bv as number) ? 1 : 0
    return sortDir === 'asc' ? cmp : -cmp
  })

  async function handleExpand(lessonId: string) {
    if (expandedLesson === lessonId) {
      setExpandedLesson(null)
      return
    }
    setExpandedLesson(lessonId)
    if (!drillData[lessonId]) {
      setDrillLoading(true)
      try {
        const res = await fetch('/api/admin/content/exercises?lessonId=' + encodeURIComponent(lessonId))
        if (res.ok) {
          const data = await res.json()
          setDrillData(prev => ({ ...prev, [lessonId]: data.exercises ?? [] }))
        }
      } catch { /* silently skip */ }
      setDrillLoading(false)
    }
  }

  const thStyle = (key: SortKey) => ({
    color: sortKey === key ? '#E8601C' : secondaryText,
    cursor: 'pointer',
    userSelect: 'none' as const,
    whiteSpace: 'nowrap' as const,
    transition: 'color 0.15s',
  })

  const SortArrow = ({ k }: { k: SortKey }) =>
    sortKey === k ? <span style={{ marginLeft: 2 }}>{sortDir === 'asc' ? '↑' : '↓'}</span> : null

  const thBase = { padding: '10px 12px', textAlign: 'left' as const, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }

  return (
    <Box borderRadius="xl" border="1px solid" borderColor="border.default" overflow="hidden">
      <Box overflowX="auto">
        <Box as="table" w="full" style={{ fontSize: '14px', borderCollapse: 'collapse' }}>
          <Box as="thead" style={{ backgroundColor: theadBg, borderBottom: '1px solid ' + tableBorder }}>
            <Box as="tr">
              <Box as="th" style={{ ...thBase, width: '32px' }} />
              <Box as="th" style={{ ...thBase, ...thStyle('lessonId') }} onClick={() => handleSort('lessonId')}>
                Lesson <SortArrow k="lessonId" />
              </Box>
              <Box as="th" style={{ ...thBase, ...thStyle('trackId') }} onClick={() => handleSort('trackId')}>
                Track <SortArrow k="trackId" />
              </Box>
              <Box as="th" style={{ ...thBase, ...thStyle('started') }} onClick={() => handleSort('started')}>
                Started <SortArrow k="started" />
              </Box>
              <Box as="th" style={{ ...thBase, ...thStyle('completed') }} onClick={() => handleSort('completed')}>
                Completed <SortArrow k="completed" />
              </Box>
              <Box as="th" style={{ ...thBase, ...thStyle('completionRate') }} onClick={() => handleSort('completionRate')}>
                Completion % <SortArrow k="completionRate" />
              </Box>
              <Box as="th" style={{ ...thBase, ...thStyle('avgScore') }} onClick={() => handleSort('avgScore')}>
                Avg score <SortArrow k="avgScore" />
              </Box>
              <Box as="th" style={{ ...thBase, ...thStyle('avgAttempts') }} onClick={() => handleSort('avgAttempts')}>
                Avg attempts <SortArrow k="avgAttempts" />
              </Box>
              <Box as="th" style={{ ...thBase, ...thStyle('avgTimeSeconds') }} onClick={() => handleSort('avgTimeSeconds')}>
                Avg time <SortArrow k="avgTimeSeconds" />
              </Box>
            </Box>
          </Box>
          <Box as="tbody">
            {sorted.map(row => (
              <>
                <Box
                  key={row.lessonId}
                  as="tr"
                  onClick={() => handleExpand(row.lessonId)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: row.flagged ? flaggedRowBg : 'transparent',
                    borderBottom: '1px solid ' + tableBorder,
                    transition: 'background-color 0.15s',
                  }}
                  _hover={{ bg: rowHoverBg }}
                >
                  <Box as="td" style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <Flex alignItems="center" gap={1} justifyContent="center">
                      {row.flagged && (
                        <Box title="Flagged: low completion or score" w="8px" h="8px" borderRadius="full" bg="#F87171" flexShrink={0} />
                      )}
                      <Text fontSize="xs" color={mutedText}>{expandedLesson === row.lessonId ? '▾' : '▸'}</Text>
                    </Flex>
                  </Box>
                  <Box as="td" style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: '12px', color: monoText }}>{row.lessonId}</Box>
                  <Box as="td" style={{ padding: '10px 12px', fontSize: '12px', color: secondaryText }}>{row.trackId}</Box>
                  <Box as="td" style={{ padding: '10px 12px', fontVariantNumeric: 'tabular-nums', color: primaryText }}>{row.started}</Box>
                  <Box as="td" style={{ padding: '10px 12px', fontVariantNumeric: 'tabular-nums', color: primaryText }}>{row.completed}</Box>
                  <Box as="td" style={{ padding: '10px 12px', fontVariantNumeric: 'tabular-nums' }}>
                    <CompletionCell value={row.completionRate} />
                  </Box>
                  <Box as="td" style={{ padding: '10px 12px', fontVariantNumeric: 'tabular-nums', color: primaryText }}>
                    {row.avgScore !== null ? row.avgScore + '%' : '—'}
                  </Box>
                  <Box as="td" style={{ padding: '10px 12px', fontVariantNumeric: 'tabular-nums', color: primaryText }}>{row.avgAttempts}×</Box>
                  <Box as="td" style={{ padding: '10px 12px', fontVariantNumeric: 'tabular-nums', color: primaryText }}>{formatTime(row.avgTimeSeconds)}</Box>
                </Box>

                {expandedLesson === row.lessonId && (
                  <Box key={row.lessonId + '-drill'} as="tr" style={{ backgroundColor: drillRowBg }}>
                    <Box as="td" colSpan={9} style={{ padding: '12px 24px' }}>
                      {drillLoading && !drillData[row.lessonId] ? (
                        <Text fontSize="xs" color={mutedText}>Loading exercises…</Text>
                      ) : (drillData[row.lessonId]?.length ?? 0) === 0 ? (
                        <Text fontSize="xs" color={mutedText}>No exercise submissions yet.</Text>
                      ) : (
                        <DrillTable exercises={drillData[row.lessonId]!} />
                      )}
                    </Box>
                  </Box>
                )}
              </>
            ))}
            {sorted.length === 0 && (
              <Box as="tr">
                <Box as="td" colSpan={9} style={{ padding: '32px 12px', textAlign: 'center', fontSize: '14px', color: mutedText }}>
                  No lesson data yet.
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

function CompletionCell({ value }: { value: number }) {
  const color = value >= 80 ? '#059669' : value >= 60 ? '#D97706' : '#EF4444'
  return <span style={{ fontWeight: 500, color }}>{value}%</span>
}

function formatTime(seconds: number): string {
  if (!seconds) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? m + 'm ' + s + 's' : s + 's'
}

interface ExerciseRow {
  exerciseIndex: number
  exerciseType: string
  submissions: number
  avgScore: number | null
  avgAttempts: number
  avgLatencyMs: number | null
}

function DrillTable({ exercises }: { exercises: ExerciseRow[] }) {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Text fontSize="xs" fontWeight="semibold" color="text.secondary" textTransform="uppercase" letterSpacing="wider">
        Exercise breakdown
      </Text>
      <Box as="table" w="full" style={{ fontSize: '12px', borderCollapse: 'collapse' }}>
        <Box as="thead">
          <Box as="tr" style={{ color: '#9CA3AF' }}>
            <Box as="th" style={{ textAlign: 'left', paddingBottom: 4, paddingRight: 16 }}>#</Box>
            <Box as="th" style={{ textAlign: 'left', paddingBottom: 4, paddingRight: 16 }}>Type</Box>
            <Box as="th" style={{ textAlign: 'right', paddingBottom: 4, paddingRight: 16 }}>Submissions</Box>
            <Box as="th" style={{ textAlign: 'right', paddingBottom: 4, paddingRight: 16 }}>Avg score</Box>
            <Box as="th" style={{ textAlign: 'right', paddingBottom: 4, paddingRight: 16 }}>Avg attempts</Box>
            <Box as="th" style={{ textAlign: 'right', paddingBottom: 4 }}>Avg latency</Box>
          </Box>
        </Box>
        <Box as="tbody">
          {exercises.map(ex => (
            <Box key={ex.exerciseIndex} as="tr" style={{ borderTop: '1px solid rgba(229,231,235,0.5)' }}>
              <Box as="td" style={{ padding: '4px 16px 4px 0', color: '#6B7280' }}>{ex.exerciseIndex + 1}</Box>
              <Box as="td" style={{ padding: '4px 16px 4px 0', fontFamily: 'monospace', color: '#374151' }}>{ex.exerciseType}</Box>
              <Box as="td" style={{ padding: '4px 16px 4px 0', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: '#1A1A1A' }}>{ex.submissions}</Box>
              <Box as="td" style={{ padding: '4px 16px 4px 0', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{ex.avgScore !== null ? ex.avgScore + '%' : '—'}</Box>
              <Box as="td" style={{ padding: '4px 16px 4px 0', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{ex.avgAttempts}×</Box>
              <Box as="td" style={{ padding: '4px 0', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: '#6B7280' }}>
                {ex.avgLatencyMs !== null ? ex.avgLatencyMs + 'ms' : '—'}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}
