import { z } from 'zod'

// ─── Shared enums ─────────────────────────────────────────────────────────────

export const PlanSchema = z.enum(['free', 'pro', 'team', 'enterprise'])
export const SkillLevelSchema = z.enum(['beginner', 'intermediate', 'advanced'])
export const LessonStatusSchema = z.enum(['locked', 'available', 'in_progress', 'completed'])
export const StreamIdSchema = z.enum([
  'foundations',
  'application',
  'advanced',
  'quick-wins',
  'core-skills',
  'role-tracks',
  'power-user',
])
export const TrackIdSchema = z.enum([
  'foundations',
  'prompting',
  'context',
  'reasoning',
  'coding',
  'writing',
  'data',
  'multimodal',
  'agents',
  'evaluation',
  'ethics',
  'advanced',
  'qw',
  'pw',
  'cs',
  'dw',
  'tw',
  'sl',
  'op',
  'pd',
  'mk',
  'fn',
  'cx',
  'hr',
  'mc',
  'aa',
])
export const ExerciseTypeSchema = z.enum([
  'prompt_write',
  'rewrite',
  'multiple_choice',
  'spot_the_error',
  'fill_in_blank',
  'order_the_steps',
  'context_builder',
])

// ─── Content schemas ──────────────────────────────────────────────────────────

export const ExplanationSectionSchema = z.object({
  type: z.literal('explanation'),
  content: z.string().min(1),
})

export const ExampleSectionSchema = z.object({
  type: z.literal('example'),
  bad: z.string().min(1),
  good: z.string().min(1),
  explanation: z.string().min(1),
})

export const ExerciseSectionSchema = z.object({
  type: z.literal('exercise'),
  exerciseType: ExerciseTypeSchema,
  prompt: z.string().min(1),
  data: z.record(z.unknown()),
})

export const LessonSectionSchema = z.discriminatedUnion('type', [
  ExplanationSectionSchema,
  ExampleSectionSchema,
  ExerciseSectionSchema,
])

export const LessonSchema = z.object({
  id: z.string().min(1),
  trackId: TrackIdSchema,
  streamId: StreamIdSchema,
  title: z.string().min(1),
  estimatedMinutes: z.number().int().positive(),
  xpReward: z.number().int().positive(),
  sections: z.array(LessonSectionSchema).min(1),
})

export const TrackSchema = z.object({
  id: TrackIdSchema,
  streamId: StreamIdSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a hex color'),
  lessonIds: z.array(z.string().min(1)).min(1),
  requiredTrackIds: z.array(TrackIdSchema),
})

// ─── API request schemas ───────────────────────────────────────────────────────

export const LessonCompleteRequestSchema = z.object({
  lessonId: z.string().min(1),
  score: z.number().min(0).max(100),
  durationSeconds: z.number().positive(),
})

export type LessonCompleteRequest = z.infer<typeof LessonCompleteRequestSchema>

export const GradeRequestSchema = z.object({
  lessonId: z.string().min(1),
  exerciseIndex: z.number().int().min(0).optional(),
  exerciseType: ExerciseTypeSchema,
  userResponse: z.string().min(1).max(4000),
  exerciseData: z.record(z.unknown()),
})

export type GradeRequest = z.infer<typeof GradeRequestSchema>

export const PlaygroundRequestSchema = z.object({
  prompt: z.string().min(1).max(8000),
  systemPrompt: z.string().max(2000).optional(),
})

export type PlaygroundRequest = z.infer<typeof PlaygroundRequestSchema>

export const ReviewSubmitSchema = z.object({
  cardId: z.string().min(1),
  quality: z.number().int().min(0).max(5), // SM-2 quality rating
})

export type ReviewSubmit = z.infer<typeof ReviewSubmitSchema>

// Used by POST /api/review
export const ReviewSubmitRequestSchema = z.object({
  lessonId: z.string().min(1),
  exerciseIndex: z.number().int().min(0),
  score: z.number().min(0).max(100),
})

export type ReviewSubmitRequest = z.infer<typeof ReviewSubmitRequestSchema>

export const CheckoutRequestSchema = z.object({
  plan: z.enum(['pro', 'team']),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
})

export type CheckoutRequest = z.infer<typeof CheckoutRequestSchema>
