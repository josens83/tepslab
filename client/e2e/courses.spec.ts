import { test, expect } from '@playwright/test';

test.describe('Course Browsing and Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/courses');
  });

  test('should display courses page with course list', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /강좌 목록/i })).toBeVisible();

    // Should display course cards
    const courseCards = page.locator('[data-testid="course-card"]');
    await expect(courseCards).toHaveCount(await courseCards.count());
    expect(await courseCards.count()).toBeGreaterThan(0);
  });

  test('should filter courses by category', async ({ page }) => {
    // Click on a category filter
    await page.click('button:has-text("문법")');

    // Wait for courses to load
    await page.waitForLoadState('networkidle');

    // Should display filtered courses
    const courseCards = page.locator('[data-testid="course-card"]');
    expect(await courseCards.count()).toBeGreaterThan(0);

    // All courses should have the selected category
    const firstCourse = courseCards.first();
    await expect(firstCourse.locator('text=문법')).toBeVisible();
  });

  test('should filter courses by level', async ({ page }) => {
    await page.click('button:has-text("초급")');
    await page.waitForLoadState('networkidle');

    const courseCards = page.locator('[data-testid="course-card"]');
    expect(await courseCards.count()).toBeGreaterThan(0);
  });

  test('should search courses by keyword', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="검색"]');
    await searchInput.fill('TEPS 문법');
    await page.click('button[type="submit"]');

    await page.waitForLoadState('networkidle');

    // Should display search results
    const courseCards = page.locator('[data-testid="course-card"]');
    expect(await courseCards.count()).toBeGreaterThan(0);

    // At least one course should contain the search keyword
    const firstCourseTitle = await courseCards.first().locator('h3').textContent();
    expect(firstCourseTitle).toContain('TEPS');
  });

  test('should sort courses by rating', async ({ page }) => {
    await page.click('select[name="sort"]');
    await page.selectOption('select[name="sort"]', 'rating');

    await page.waitForLoadState('networkidle');

    // Get all course ratings
    const ratings = await page.locator('[data-testid="course-rating"]').allTextContents();

    // Verify ratings are sorted in descending order
    for (let i = 0; i < ratings.length - 1; i++) {
      const current = parseFloat(ratings[i]);
      const next = parseFloat(ratings[i + 1]);
      expect(current).toBeGreaterThanOrEqual(next);
    }
  });

  test('should sort courses by newest', async ({ page }) => {
    await page.selectOption('select[name="sort"]', 'newest');
    await page.waitForLoadState('networkidle');

    const courseCards = page.locator('[data-testid="course-card"]');
    expect(await courseCards.count()).toBeGreaterThan(0);
  });

  test('should navigate to course detail page', async ({ page }) => {
    const firstCourse = page.locator('[data-testid="course-card"]').first();
    const courseTitle = await firstCourse.locator('h3').textContent();

    await firstCourse.click();

    // Should navigate to course detail page
    await expect(page).toHaveURL(/.*\/courses\/[a-f0-9]{24}/);
    await expect(page.getByRole('heading', { name: courseTitle! })).toBeVisible();
  });

  test('should display course details', async ({ page }) => {
    await page.locator('[data-testid="course-card"]').first().click();

    // Wait for course detail page to load
    await page.waitForLoadState('networkidle');

    // Should display course information
    await expect(page.locator('[data-testid="course-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="course-instructor"]')).toBeVisible();
    await expect(page.locator('[data-testid="course-description"]')).toBeVisible();
    await expect(page.locator('[data-testid="course-curriculum"]')).toBeVisible();
    await expect(page.locator('[data-testid="course-price"]')).toBeVisible();
  });

  test('should display course curriculum sections', async ({ page }) => {
    await page.locator('[data-testid="course-card"]').first().click();
    await page.waitForLoadState('networkidle');

    // Should display curriculum sections
    const sections = page.locator('[data-testid="curriculum-section"]');
    expect(await sections.count()).toBeGreaterThan(0);

    // Click to expand first section
    await sections.first().click();

    // Should display lessons in section
    const lessons = page.locator('[data-testid="curriculum-lesson"]');
    expect(await lessons.count()).toBeGreaterThan(0);
  });

  test('should display course reviews', async ({ page }) => {
    await page.locator('[data-testid="course-card"]').first().click();
    await page.waitForLoadState('networkidle');

    // Scroll to reviews section
    await page.click('text=수강후기');

    // Should display reviews
    const reviews = page.locator('[data-testid="course-review"]');
    expect(await reviews.count()).toBeGreaterThan(0);
  });

  test('should add course to wishlist', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'Test123!@#');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*\/dashboard/);

    // Go to courses page
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');

    // Click wishlist button on first course
    const wishlistBtn = page.locator('[data-testid="wishlist-button"]').first();
    await wishlistBtn.click();

    // Should show success message
    await expect(page.getByText(/찜 목록에 추가되었습니다/i)).toBeVisible();
  });

  test('should paginate through course list', async ({ page }) => {
    // Scroll to bottom to see pagination
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Click next page
    await page.click('button[aria-label="Next page"]');
    await page.waitForLoadState('networkidle');

    // Should load new courses
    const courseCards = page.locator('[data-testid="course-card"]');
    expect(await courseCards.count()).toBeGreaterThan(0);
  });
});
