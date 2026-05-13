import { LessonClient } from './LessonClient'
import { getLesson } from '@/lib/lessonEngine'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface LessonPageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const lesson = await getLesson(params.id)
  if (!lesson) return { title: 'Lesson Not Found' }
  return {
    title: lesson.title,
    description: `Learn ${lesson.title} — a bite-sized AI fluency lesson.`,
  }
}

export default async function LessonPage({ params }: LessonPageProps) {
  const lesson = await getLesson(params.id)
  if (!lesson) notFound()

  return <LessonClient lesson={lesson} />
}
