import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { getProgressMap } from '@/lib/progressEngine'
import type { TrackProgressData, LessonStatus } from '@/types'

export const metadata = {
  title: 'Learn',
  description: 'Your AI fluency learning path — explore all tracks and pick up where you left off.',
}

function CircleProgress({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max === 0 ? 0 : value / max
  const r = 20
  const circ = 2 * Math.PI * r
  const dash = circ * pct

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px' }}>
      <svg width="56" height="56" viewBox="0 0 56 56" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="28" cy="28" r={r} fill="none" stroke="#E5E7EB" strokeWidth="4" />
        <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="4" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <span style={{ position: 'absolute', fontSize: '10px', fontWeight: 'bold', color: '#1A1A1A' }}>
        {Math.round(pct * 100)}%
      </span>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg style={{ height: '32px', width: '32px', color: 'white' }} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  )
}

function LightningIcon() {
  return (
    <svg style={{ height: '32px', width: '32px', color: 'white' }} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg style={{ height: '28px', width: '28px', color: '#C4C9D4' }} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
    </svg>
  )
}

function ColoredConnector({ fromLeft, color, dim }: { fromLeft: boolean; color: string; dim: boolean }) {
  const w = 100
  const h = 48
  const d = fromLeft
    ? `M 20 0 C 20 ${h * 0.6}, ${w - 20} ${h * 0.6}, ${w - 20} ${h}`
    : `M ${w - 20} 0 C ${w - 20} ${h * 0.6}, 20 ${h * 0.6}, 20 ${h}`

  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: 0 }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
        <path d={d} fill="none" stroke={dim ? '#E5E7EB' : color} strokeWidth="4" strokeLinecap="round" opacity={dim ? 0.5 : 1} />
      </svg>
    </div>
  )
}

function NodeLabel({ title, status, align }: { title: string; status: LessonStatus; align: 'left' | 'right' }) {
  const color = status === 'locked' ? '#C4C9D4' : status === 'available' ? '#1A1A1A' : '#6B7280'
  return (
    <div style={{ flex: 1, paddingTop: '16px', textAlign: align }}>
      <p style={{ fontSize: '13px', fontWeight: 600, lineHeight: 1.3, color }}>{title}</p>
    </div>
  )
}

function NodeSquare({ lessonId, status, hexColor, xpReward }: {
  lessonId: string
  status: LessonStatus
  hexColor: string
  xpReward: number
}) {
  const href = status !== 'locked' ? `/lesson/${lessonId}` : undefined
  const bg = status === 'locked' ? '#F3F4F6' : hexColor

  const inner = (
    <div
      style={{
        flexShrink: 0,
        width: '72px',
        height: '72px',
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: bg,
        transition: 'transform 0.1s',
      }}
      aria-label={`${xpReward} XP`}
    >
      {status === 'completed' && <CheckIcon />}
      {status === 'available' && <LightningIcon />}
      {status === 'locked' && <LockIcon />}
    </div>
  )

  if (href) {
    return <Link href={href} style={{ flexShrink: 0 }}>{inner}</Link>
  }
  return <div style={{ flexShrink: 0 }}>{inner}</div>
}

function TrackNodes({ trackData }: { trackData: TrackProgressData }) {
  const { track, lessons, completedCount, totalCount, isUnlocked } = trackData
  const currentLesson = lessons.find(l => l.status === 'available')

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', padding: '0 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ height: '16px', width: '16px', borderRadius: '50%', flexShrink: 0, backgroundColor: track.color }} />
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1A1A1A' }}>{track.title}</h2>
          {!isUnlocked && (
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#9CA3AF', background: '#F3F4F6', padding: '2px 8px', borderRadius: '9999px' }}>
              Locked
            </span>
          )}
        </div>
        <CircleProgress value={completedCount} max={totalCount} color={track.color} />
      </div>

      <div>
        {lessons.map(({ lesson, status }, i) => {
          const isLeft = i % 2 === 0
          const isLast = i === lessons.length - 1
          const isCurrent = lesson.id === currentLesson?.lesson.id

          return (
            <div key={lesson.id}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', justifyContent: isLeft ? 'flex-start' : 'flex-end' }}>
                {!isLeft && (
                  <NodeLabel title={lesson.title} status={status} align="right" />
                )}
                <NodeSquare lessonId={lesson.id} status={status} hexColor={track.color} xpReward={lesson.xpReward} />
                {isLeft && (
                  <NodeLabel title={lesson.title} status={status} align="left" />
                )}
              </div>

              {isCurrent && (
                <div style={{ marginTop: '12px', marginBottom: '8px', ...(isLeft ? { marginLeft: '88px' } : { marginRight: '88px' }) }}>
                  <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#FFFBEB', border: '1px solid rgba(252,211,77,0.4)', borderRadius: '8px', padding: '2px 8px' }}>
                        <svg style={{ height: '12px', width: '12px', color: '#F59E0B' }} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#F59E0B' }}>+{lesson.xpReward} XP</span>
                      </div>
                      <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{lesson.estimatedMinutes} min</span>
                    </div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A', marginBottom: '4px', lineHeight: 1.3 }}>{lesson.title}</p>
                    <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '12px' }}>{track.title}</p>
                    <Link
                      href={`/lesson/${lesson.id}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '40px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: 'white',
                        backgroundColor: track.color,
                        textDecoration: 'none',
                      }}
                    >
                      Continue &rarr;
                    </Link>
                  </div>
                </div>
              )}

              {!isLast && (
                <ColoredConnector fromLeft={isLeft} color={track.color} dim={status === 'locked'} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default async function LearnPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let progressMap = null
  let xpTotal = 0
  let currentStreak = 0

  if (user) {
    try {
      progressMap = await getProgressMap(user.id)

      const { data: profile } = await supabase
        .from('users')
        .select('xp_total, current_streak')
        .eq('id', user.id)
        .single()

      xpTotal = profile?.xp_total ?? 0
      currentStreak = profile?.current_streak ?? 0
    } catch {
      // Non-fatal
    }
  }

  const allTracks = progressMap?.streams.flatMap(s => s.tracks) ?? []

  return (
    <div style={{ marginLeft: '-16px', marginRight: '-16px', marginTop: '-24px' }}>
      {/* Top status bar */}
      <div style={{ padding: '16px', paddingBottom: '12px', background: '#FAFAFA', position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button style={{ padding: '4px', color: '#9CA3AF' }} aria-label="Track menu">
              <svg style={{ height: '20px', width: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span style={{ fontSize: '15px', fontWeight: 600, color: '#1A1A1A' }}>Learning Path</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#FFFBEB', border: '1px solid rgba(252,211,77,0.4)', borderRadius: '8px', padding: '4px 10px' }}>
              <svg style={{ height: '14px', width: '14px', color: '#F59E0B' }} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#F59E0B', fontVariantNumeric: 'tabular-nums' }}>{xpTotal}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#FFF7ED', border: '1px solid rgba(232,96,28,0.2)', borderRadius: '8px', padding: '4px 10px' }}>
              <svg style={{ height: '14px', width: '14px', color: '#E8601C' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#E8601C', fontVariantNumeric: 'tabular-nums' }}>{currentStreak}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Node map */}
      <div
        style={{
          padding: '24px',
          paddingBottom: '40px',
          maxWidth: '720px',
          margin: '0 auto',
          backgroundImage: 'radial-gradient(circle, #E5E7EB 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      >
        {allTracks.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '56px' }}>
            {allTracks.map(trackData => (
              <TrackNodes key={trackData.track.id} trackData={trackData} />
            ))}
          </div>
        ) : (
          <div style={{ borderRadius: '16px', border: '1px dashed #E5E7EB', background: 'rgba(255,255,255,0.8)', padding: '32px', textAlign: 'center' }}>
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A1A', marginBottom: '8px' }}>
              Sign in to track your progress
            </p>
            <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>
              Your learning path and XP are saved to your account.
            </p>
            <Link
              href="/login"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: '40px', padding: '0 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: 'white', background: '#0EA5E9', textDecoration: 'none' }}
            >
              Get started
            </Link>
          </div>
        )}

        {allTracks.length > 0 && (
          <div style={{ marginTop: '56px', borderRadius: '16px', border: '1px dashed #E5E7EB', background: 'rgba(255,255,255,0.8)', padding: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A', marginBottom: '4px' }}>More tracks coming soon</p>
            <p style={{ fontSize: '12px', color: '#6B7280' }}>
              Complete the Foundations stream to unlock Application and Advanced tracks.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
