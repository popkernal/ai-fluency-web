// ─── User & Auth ──────────────────────────────────────────────────────────────

export type Plan = 'free' | 'pro' | 'team' | 'enterprise'
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced'

export interface UserProfile {
  id: string
  email: string
  displayName: string
  avatarUrl?: string
  plan: Plan
  skillLevel?: SkillLevel
  orgId?: string
  xpTotal: number
  level: number
  currentStreak: number
  longestStreak: number
  createdAt: string
}

// ─── Content — Streams ────────────────────────────────────────────────────────

export type StreamId = 'foundations' | 'application' | 'advanced' | 'quick-wins' | 'core-skills' | 'role-tracks' | 'power-user' | 'tools-reference'

export interface Stream {
  id: StreamId
  title: string
  description: string
  trackIds: string[]
}

// ─── Content — Tracks ─────────────────────────────────────────────────────────

export type TrackId =
  | 'foundations'
  | 'prompting'
  | 'context'
  | 'reasoning'
  | 'coding'
  | 'writing'
  | 'data'
  | 'multimodal'
  | 'agents'
  | 'evaluation'
  | 'ethics'
  | 'advanced'
  | 'qw'
  | 'pw'
  | 'cs'
  | 'dw'
  | 'tw'
  | 'sl'
  | 'op'
  | 'pd'
  | 'mk'
  | 'fn'
  | 'cx'
  | 'hr'
  | 'mc'
  | 'aa'
  | 'models'
  | 'interfaces'
  | 'glossary'

export interface Track {
  id: TrackId
  streamId: StreamId
  title: string
  description: string
  color: string         // hex color, e.g. "#0EA5E9"
  lessonIds: string[]
  requiredTrackIds: TrackId[]
}

// ─── Content — Exercises ──────────────────────────────────────────────────────

export type ExerciseType =
  | 'prompt_write'
  | 'rewrite'
  | 'multiple_choice'
  | 'spot_the_error'
  | 'fill_in_blank'
  | 'order_the_steps'
  | 'context_builder'

// ─── Content — Sections ───────────────────────────────────────────────────────

export type ExplanationSection = {
  type: 'explanation'
  content: string
}

export type ExampleSection = {
  type: 'example'
  bad: string
  good: string
  explanation: string
}

export type ExerciseSection = {
  type: 'exercise'
  exerciseType: ExerciseType
  prompt: string
  data: Record<string, unknown>
}

export type LessonSection = ExplanationSection | ExampleSection | ExerciseSection

// ─── Content — Lessons ────────────────────────────────────────────────────────

export interface Lesson {
  id: string
  trackId: TrackId
  streamId: StreamId
  title: string
  estimatedMinutes: number
  xpReward: number
  sections: LessonSection[]
}

// ─── Grading ──────────────────────────────────────────────────────────────────

export interface GradeResult {
  isCorrect: boolean
  score: number          // 0–100
  feedback: string       // encouraging but specific
  suggestions?: string[]
}

// ─── Progress ─────────────────────────────────────────────────────────────────

export type LessonStatus = 'locked' | 'available' | 'in_progress' | 'completed'

export interface LessonProgressRow {
  lessonId: string
  trackId: string
  status: LessonStatus
  score?: number
  completedAt?: string
}

export interface TrackProgressData {
  track: Track
  lessons: Array<{
    lesson: Lesson
    status: LessonStatus
    score?: number
  }>
  completedCount: number
  totalCount: number
  isUnlocked: boolean
}

export interface ProgressMap {
  streams: Array<{
    streamId: StreamId
    tracks: TrackProgressData[]
  }>
}

// ─── Gamification ─────────────────────────────────────────────────────────────

export interface StreakData {
  currentStreak: number
  longestStreak: number
  lastActivityDate: string
  freezesAvailable: number
}

export interface XPData {
  totalXP: number
  level: number
  xpToNextLevel: number
  weeklyXP: number
}

export interface AchievementDef {
  id: string
  title: string
  description: string
  icon: string
}

export interface UserAchievement {
  id: string
  title: string
  description: string
  earnedAt?: string
}

// ─── Review ───────────────────────────────────────────────────────────────────

export interface ReviewItem {
  id: string
  lessonId: string
  exerciseIndex: number
  exerciseType: ExerciseType
  prompt: string
  data: Record<string, unknown>
  dueAt: string
  strength: number    // 0–100
  intervalDays: number
  timesReviewed: number
}

// ─── Organization ─────────────────────────────────────────────────────────────

export interface Organization {
  id: string
  name: string
  slug: string
  logoUrl?: string
  plan: 'free' | 'pro' | 'enterprise'
  maxSeats: number
  createdAt: string
}

export interface OrgMember {
  id: string
  orgId: string
  userId: string
  role: 'member' | 'admin' | 'owner'
  status: 'pending' | 'active' | 'deactivated'
  joinedAt?: string
}

// ─── Analytics events ─────────────────────────────────────────────────────────

export interface LessonStartedEvent {
  lessonId: string
  trackId: TrackId
  skillLevel: SkillLevel
}

export interface LessonCompletedEvent {
  lessonId: string
  trackId: TrackId
  xpEarned: number
  score: number
  durationSeconds: number
}

export interface ExerciseSubmittedEvent {
  lessonId: string
  exerciseType: ExerciseType
  isCorrect: boolean
  attemptNumber: number
}

export interface PlaygroundUsedEvent {
  promptLength: number
  responseLength: number
  plan: Plan
}
