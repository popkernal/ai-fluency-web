/**
 * Load and sequence lessons from local JSON content files.
 * No CMS for MVP — all content lives in /content/tracks/*.json
 * and /content/lessons/*.json.
 */
import type { Track, Lesson, Stream, StreamId, TrackId } from '@/types'

// ─── Stream definitions ────────────────────────────────────────────────────────

const STREAMS: Stream[] = [
  {
    id: 'foundations',
    title: 'Foundations',
    description: 'Build a solid understanding of AI concepts and prompting fundamentals.',
    trackIds: ['foundations', 'claude-setup', 'prompting'],
  },
  {
    id: 'application',
    title: 'Application',
    description: 'Apply AI skills to real-world tasks: writing, coding, data, and more.',
    trackIds: ['context', 'reasoning', 'coding', 'writing', 'data', 'multimodal'],
  },
  {
    id: 'advanced',
    title: 'Advanced',
    description: 'Master multi-step agents, evaluation, ethics, and production AI systems.',
    trackIds: ['agents', 'evaluation', 'ethics', 'advanced'],
  },
  {
    id: 'quick-wins',
    title: 'Quick Wins',
    description: 'Get immediate results with AI in minutes — no prior experience needed.',
    trackIds: ['qw', 'pw'],
  },
  {
    id: 'core-skills',
    title: 'Core Skills',
    description: 'Build essential AI fluency skills for everyday professional work.',
    trackIds: ['cs', 'dw', 'tw'],
  },
  {
    id: 'role-tracks',
    title: 'Role Tracks',
    description: 'Specialized AI skills tailored to your professional role.',
    trackIds: ['sl', 'op', 'pd', 'mk', 'fn', 'cx', 'hr'],
  },
  {
    id: 'power-user',
    title: 'Power User',
    description: 'Advanced techniques for getting the most out of AI tools.',
    trackIds: ['mc', 'aa'],
  },
  {
    id: 'tools-reference',
    title: 'Tools & Reference',
    description: 'Model comparisons, interface guides, and a glossary of AI terms.',
    trackIds: ['models', 'interfaces', 'glossary'],
  },
]

// ─── Track cache (loaded lazily) ───────────────────────────────────────────────

const trackCache = new Map<string, Track>()
const lessonCache = new Map<string, Lesson>()

// ─── Stream queries ────────────────────────────────────────────────────────────

export function getAllStreams(): Stream[] {
  return STREAMS
}

export function getStreamById(streamId: StreamId): Stream | null {
  return STREAMS.find(s => s.id === streamId) ?? null
}

// ─── Track queries ─────────────────────────────────────────────────────────────

export async function getTrack(trackId: TrackId): Promise<Track | null> {
  if (trackCache.has(trackId)) {
    return trackCache.get(trackId)!
  }
  try {
    const mod = await import(`@/content/tracks/${trackId}.json`)
    const track = mod.default as Track
    trackCache.set(trackId, track)
    return track
  } catch {
    return null
  }
}

export async function getAllTracks(): Promise<Track[]> {
  const allTrackIds: TrackId[] = STREAMS.flatMap(s => s.trackIds as TrackId[])
  const tracks = await Promise.all(allTrackIds.map(id => getTrack(id)))
  return tracks.filter((t): t is Track => t !== null)
}

export async function getTracksForStream(streamId: StreamId): Promise<Track[]> {
  const stream = getStreamById(streamId)
  if (!stream) return []
  const tracks = await Promise.all(stream.trackIds.map(id => getTrack(id as TrackId)))
  return tracks.filter((t): t is Track => t !== null)
}

// ─── Lesson queries ────────────────────────────────────────────────────────────

export async function getLesson(lessonId: string): Promise<Lesson | null> {
  if (lessonCache.has(lessonId)) {
    return lessonCache.get(lessonId)!
  }
  try {
    const mod = await import(`@/content/lessons/${lessonId}.json`)
    const lesson = mod.default as Lesson
    lessonCache.set(lessonId, lesson)
    return lesson
  } catch {
    return null
  }
}

export async function getLessonsForTrack(trackId: TrackId): Promise<Lesson[]> {
  const track = await getTrack(trackId)
  if (!track) return []
  const lessons = await Promise.all(track.lessonIds.map(id => getLesson(id)))
  return lessons.filter((l): l is Lesson => l !== null)
}

// ─── Unlock logic ──────────────────────────────────────────────────────────────

/**
 * Returns true if the given track's required tracks have all been completed.
 * completedTrackIds is the set of track IDs where all lessons are done.
 */
export async function isTrackUnlocked(
  trackId: TrackId,
  completedTrackIds: Set<TrackId>
): Promise<boolean> {
  const track = await getTrack(trackId)
  if (!track) return false
  if (track.requiredTrackIds.length === 0) return true
  return track.requiredTrackIds.every(dep => completedTrackIds.has(dep))
}

/**
 * Returns the status of a specific lesson given which lessons the user has completed.
 *
 * Rules:
 * - First lesson in a track is available if the track is unlocked
 * - Subsequent lessons unlock one at a time (complete lesson N to unlock N+1)
 * - Completed lessons stay completed
 */
export async function getLessonStatus(
  lessonId: string,
  completedLessonIds: Set<string>,
  completedTrackIds: Set<TrackId>
): Promise<'locked' | 'available' | 'completed'> {
  if (completedLessonIds.has(lessonId)) return 'completed'

  // Find the track that owns this lesson
  const lesson = await getLesson(lessonId)
  if (!lesson) return 'locked'

  const track = await getTrack(lesson.trackId)
  if (!track) return 'locked'

  // Track must be unlocked first
  const trackUnlocked = await isTrackUnlocked(lesson.trackId, completedTrackIds)
  if (!trackUnlocked) return 'locked'

  const lessonIndex = track.lessonIds.indexOf(lessonId)
  if (lessonIndex === -1) return 'locked'

  // First lesson in track is immediately available if track is unlocked
  if (lessonIndex === 0) return 'available'

  // Otherwise, the previous lesson must be completed
  const prevLessonId = track.lessonIds[lessonIndex - 1]
  if (completedLessonIds.has(prevLessonId)) return 'available'

  return 'locked'
}

/**
 * Returns the next lesson to take in a track (first non-completed lesson),
 * or null if the track is fully completed or locked.
 */
export async function getNextLesson(
  trackId: TrackId,
  completedLessonIds: Set<string>
): Promise<Lesson | null> {
  const track = await getTrack(trackId)
  if (!track) return null

  for (const lessonId of track.lessonIds) {
    if (!completedLessonIds.has(lessonId)) {
      return getLesson(lessonId)
    }
  }

  return null // all completed
}

/**
 * Returns true if the track has been fully completed (all lessons done).
 */
export async function isTrackCompleted(
  trackId: TrackId,
  completedLessonIds: Set<string>
): Promise<boolean> {
  const track = await getTrack(trackId)
  if (!track) return false
  return track.lessonIds.every(id => completedLessonIds.has(id))
}
