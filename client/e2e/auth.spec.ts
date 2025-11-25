import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await page.click('text=로그인');
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.getByRole('heading', { name: /로그인/i })).toBeVisible();
  });

  test('should display signup page', async ({ page }) => {
    await page.click('text=회원가입');
    await expect(page).toHaveURL(/.*\/register/);
    await expect(page.getByRole('heading', { name: /회원가입/i })).toBeVisible();
  });

  test('should show validation errors on empty login form', async ({ page }) => {
    await page.goto('/login');
    await page.click('button[type="submit"]');

    // Check for validation errors
    await expect(page.getByText(/이메일을 입력해주세요/i)).toBeVisible();
    await expect(page.getByText(/비밀번호를 입력해주세요/i)).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Should display error message
    await expect(page.getByText(/이메일 또는 비밀번호가 올바르지 않습니다/i)).toBeVisible();
  });

  test('should register new user successfully', async ({ page }) => {
    await page.goto('/register');

    const timestamp = Date.now();
    const email = `test${timestamp}@example.com`;

    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[type="email"]', email);
    await page.fill('input[name="password"]', 'Test123!@#');
    await page.fill('input[name="confirmPassword"]', 'Test123!@#');
    await page.fill('input[type="tel"]', '01012345678');

    // Check terms agreement
    await page.check('input[name="agreeTerms"]');

    await page.click('button[type="submit"]');

    // Should redirect to dashboard or show success message
    await page.waitForURL(/.*\/(dashboard|courses)/);
    await expect(page.getByText(/환영합니다/i)).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login');

    // Use test credentials
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'Test123!@#');
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await page.waitForURL(/.*\/dashboard/);
    await expect(page.getByText(/대시보드/i)).toBeVisible();
  });

  test('should logout successfully', async ({ page, context }) => {
    // First login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'Test123!@#');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*\/dashboard/);

    // Then logout
    await page.click('button[aria-label="User menu"]');
    await page.click('text=로그아웃');

    // Should redirect to home
    await expect(page).toHaveURL('/');
    await expect(page.getByText(/로그인/i)).toBeVisible();
  });

  test('should persist login after page refresh', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'Test123!@#');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*\/dashboard/);

    // Reload page
    await page.reload();

    // Should still be logged in
    await expect(page).toHaveURL(/.*\/dashboard/);
  });
});
