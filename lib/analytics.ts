/**
 * Typed PostHog event helpers.
 * All analytics calls go through this file — never call posthog directly from components.
 */
import posthog from 'posthog-js'
import type {
  TrackId,
  ExerciseType,
  Plan,
  SkillLevel,
  LessonStartedEvent,
  LessonCompletedEvent,
  ExerciseSubmittedEvent,
  PlaygroundUsedEvent,
} from '@/types'

// ─── Identity ─────────────────────────────────────────────────────────────────

/**
 * Identify a user on login/session start.
 */
export function identifyUser(
  userId: string,
  properties: {
    email: string
    plan: Plan
    skillLevel: SkillLevel
    orgId?: string
  }
) {
  posthog.identify(userId, properties)
}

/**
 * Associate the current user with an org (group analytics).
 */
export function identifyOrg(orgId: string, orgProperties?: Record<string, unknown>) {
  posthog.group('organization', orgId, orgProperties)
}

/**
 * Reset identity on logout.
 */
export function resetIdentity() {
  posthog.reset()
}

// ─── Lesson events ────────────────────────────────────────────────────────────

export function trackLessonStarted(event: LessonStartedEvent) {
  posthog.capture('lesson_started', event)
}

export function trackLessonCompleted(event: LessonCompletedEvent) {
  posthog.capture('lesson_completed', event)
}

export function trackLessonAbandoned(lessonId: string, trackId: TrackId, sectionIndex: number) {
  posthog.capture('lesson_abandoned', { lessonId, trackId, sectionIndex })
}

// ─── Exercise events ──────────────────────────────────────────────────────────

export function trackExerciseSubmitted(event: ExerciseSubmittedEvent) {
  posthog.capture('exercise_submitted', event)
}

export function trackExerciseHintUsed(lessonId: string, exerciseType: ExerciseType) {
  posthog.capture('exercise_hint_used', { lessonId, exerciseType })
}

// ─── Review events ────────────────────────────────────────────────────────────

export function trackReviewSessionStarted(cardCount: number) {
  posthog.capture('review_session_started', { cardCount })
}

export function trackReviewSessionCompleted(cardCount: number, correctCount: number) {
  posthog.capture('review_session_completed', { cardCount, correctCount })
}

// ─── Playground events ────────────────────────────────────────────────────────

export function trackPlaygroundUsed(event: PlaygroundUsedEvent) {
  posthog.capture('playground_used', event)
}

export function trackPlaygroundLimitHit(plan: Plan) {
  posthog.capture('playground_limit_hit', { plan })
}

// ─── Upgrade / monetization ───────────────────────────────────────────────────

export function trackUpgradeModalShown(trigger: string, plan: Plan) {
  posthog.capture('upgrade_modal_shown', { trigger, currentPlan: plan })
}

export function trackUpgradeCompleted(fromPlan: Plan, toPlan: Plan) {
  posthog.capture('upgrade_completed', { fromPlan, toPlan })
}

export function trackUpgradeDismissed(trigger: string) {
  posthog.capture('upgrade_dismissed', { trigger })
}

// ─── Onboarding events ────────────────────────────────────────────────────────

export function trackOnboardingStarted() {
  posthog.capture('onboarding_started')
}

export function trackOnboardingCompleted(skillLevel: SkillLevel, recommendedTrack: TrackId) {
  posthog.capture('onboarding_completed', { skillLevel, recommendedTrack })
}

// ─── Navigation events ────────────────────────────────────────────────────────

export function trackPageView(path: string, title?: string) {
  posthog.capture('$pageview', { $current_url: path, title })
}

// ─── Streak / gamification events ─────────────────────────────────────────────

export function trackStreakMilestone(streak: number) {
  posthog.capture('streak_milestone', { streak })
}

export function trackAchievementEarned(achievementId: string) {
  posthog.capture('achievement_earned', { achievementId })
}

export function trackLevelUp(newLevel: number, totalXP: number) {
  posthog.capture('level_up', { newLevel, totalXP })
}
