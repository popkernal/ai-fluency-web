/**
 * Content validation script.
 * Run with: bun scripts/validate-content.ts
 *
 * Validates all track and lesson JSON files against Zod schemas.
 * Exits with code 1 if any file fails validation.
 */

import { readdirSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { TrackSchema, LessonSchema } from '../lib/validators'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = join(__dirname, '..')
const TRACKS_DIR = join(ROOT, 'content', 'tracks')
const LESSONS_DIR = join(ROOT, 'content', 'lessons')

let errorCount = 0

function validateFile(filePath: string, schema: typeof TrackSchema | typeof LessonSchema) {
  const raw = readFileSync(filePath, 'utf-8')
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch (e) {
    console.error(`  ✗ JSON parse error in ${filePath}:`, (e as Error).message)
    errorCount++
    return
  }

  const result = schema.safeParse(data)
  if (!result.success) {
    console.error(`  ✗ ${filePath}`)
    for (const issue of result.error.issues) {
      console.error(`    • ${issue.path.join('.')} — ${issue.message}`)
    }
    errorCount++
  } else {
    console.log(`  ✓ ${filePath.replace(ROOT, '').replace(/^\//, '')}`)
  }
}

// ─── Validate tracks ──────────────────────────────────────────────────────────

console.log('\nValidating tracks...')
const trackFiles = readdirSync(TRACKS_DIR).filter(f => f.endsWith('.json'))

if (trackFiles.length === 0) {
  console.warn('  ⚠ No track files found in content/tracks/')
} else {
  for (const file of trackFiles) {
    validateFile(join(TRACKS_DIR, file), TrackSchema)
  }
}

// ─── Validate lessons ─────────────────────────────────────────────────────────

console.log('\nValidating lessons...')
const lessonFiles = readdirSync(LESSONS_DIR).filter(f => f.endsWith('.json'))

if (lessonFiles.length === 0) {
  console.warn('  ⚠ No lesson files found in content/lessons/')
} else {
  for (const file of lessonFiles) {
    validateFile(join(LESSONS_DIR, file), LessonSchema)
  }
}

// ─── Cross-reference check ────────────────────────────────────────────────────

console.log('\nChecking cross-references...')

const trackData = trackFiles.map(f => {
  const raw = readFileSync(join(TRACKS_DIR, f), 'utf-8')
  return JSON.parse(raw) as { id: string; lessonIds: string[] }
})

const lessonIds = new Set(
  lessonFiles.map(f => f.replace('.json', ''))
)

for (const track of trackData) {
  for (const lessonId of track.lessonIds) {
    if (!lessonIds.has(lessonId)) {
      console.error(`  ✗ Track "${track.id}" references missing lesson: ${lessonId}`)
      errorCount++
    } else {
      console.log(`  ✓ ${track.id} → ${lessonId}`)
    }
  }
}

// ─── Result ───────────────────────────────────────────────────────────────────

console.log('')
if (errorCount > 0) {
  console.error(`\n✗ Validation failed with ${errorCount} error(s).\n`)
  process.exit(1)
} else {
  const total = trackFiles.length + lessonFiles.length
  console.log(`✓ All ${total} content files are valid.\n`)
}
