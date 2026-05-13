import { test, expect } from '@playwright/test'

test.describe('Smoke tests', () => {
  test('home page loads', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('AI Fluency')).toBeVisible()
  })

  test('learn page loads', async ({ page }) => {
    await page.goto('/learn')
    await expect(page.getByText('Progress Map')).toBeVisible()
  })

  test('playground page loads', async ({ page }) => {
    await page.goto('/playground')
    await expect(page.getByText('Prompt Playground')).toBeVisible()
  })

  test('profile page loads', async ({ page }) => {
    await page.goto('/profile')
    await expect(page.getByText('Your Profile')).toBeVisible()
  })

  test('health endpoint returns ok', async ({ request }) => {
    const res = await request.get('/api/health')
    expect(res.ok()).toBe(true)
    const json = await res.json()
    expect(json.status).toBe('ok')
  })
})
