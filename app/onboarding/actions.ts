'use server'

import { createClient } from '@/lib/supabase-server'
import { getSkillLevel, initializeProgress, getRecommendedTrack, type QuizAnswers } from '@/lib/difficultyEngine'
import { redirect } from 'next/navigation'

/**
 * Called after onboarding quiz completes.
 * Saves skill_level, initializes lesson progress, marks onboarding as done.
 */
export async function completeOnboarding(quizAnswers: QuizAnswers) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const skillLevel = getSkillLevel(quizAnswers)
  const recommendedTrack = getRecommendedTrack(skillLevel)

  // Save skill level and mark onboarding complete
  await supabase
    .from('users')
    .update({
      skill_level: skillLevel,
      onboarding_completed: true,
    })
    .eq('id', user.id)

  // Initialize lesson progress rows based on skill level
  await initializeProgress(user.id, skillLevel)

  return { skillLevel, recommendedTrack }
}
