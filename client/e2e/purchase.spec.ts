import { test, expect } from '@playwright/test';

test.describe('Course Purchase Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'Test123!@#');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*\/dashboard/);
  });

  test('should navigate to checkout from course detail page', async ({ page }) => {
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');

    // Click on first course
    await page.locator('[data-testid="course-card"]').first().click();
    await page.waitForLoadState('networkidle');

    // Click enroll button
    await page.click('button:has-text("수강신청")');

    // Should navigate to checkout page
    await expect(page).toHaveURL(/.*\/checkout/);
  });

  test('should display checkout summary', async ({ page }) => {
    await page.goto('/courses');
    await page.locator('[data-testid="course-card"]').first().click();
    await page.click('button:has-text("수강신청")');

    // Should display order summary
    await expect(page.getByText(/주문 정보/i)).toBeVisible();
    await expect(page.locator('[data-testid="course-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="course-price"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-price"]')).toBeVisible();
  });

  test('should apply coupon code', async ({ page }) => {
    await page.goto('/courses');
    await page.locator('[data-testid="course-card"]').first().click();
    await page.click('button:has-text("수강신청")');

    // Get original price
    const originalPrice = await page.locator('[data-testid="total-price"]').textContent();

    // Apply coupon
    await page.fill('input[name="couponCode"]', 'WELCOME10');
    await page.click('button:has-text("적용")');

    // Wait for discount to be applied
    await expect(page.getByText(/쿠폰이 적용되었습니다/i)).toBeVisible();

    // Price should be reduced
    const discountedPrice = await page.locator('[data-testid="total-price"]').textContent();
    expect(discountedPrice).not.toBe(originalPrice);
  });

  test('should show error for invalid coupon', async ({ page }) => {
    await page.goto('/courses');
    await page.locator('[data-testid="course-card"]').first().click();
    await page.click('button:has-text("수강신청")');

    await page.fill('input[name="couponCode"]', 'INVALID_COUPON');
    await page.click('button:has-text("적용")');

    await expect(page.getByText(/유효하지 않은 쿠폰입니다/i)).toBeVisible();
  });

  test('should proceed to payment with card', async ({ page }) => {
    await page.goto('/courses');
    await page.locator('[data-testid="course-card"]').first().click();
    await page.click('button:has-text("수강신청")');

    // Select payment method
    await page.click('input[value="card"]');

    // Agree to terms
    await page.check('input[name="agreeTerms"]');

    // Click payment button
    await page.click('button:has-text("결제하기")');

    // Should redirect to TossPayments or show payment widget
    // Note: In real testing, you'd need to mock or use test credentials
    await page.waitForTimeout(2000);

    // Should see TossPayments widget or redirect
    expect(page.url()).toMatch(/(toss|checkout|payment)/);
  });

  test('should proceed to payment with virtual account', async ({ page }) => {
    await page.goto('/courses');
    await page.locator('[data-testid="course-card"]').first().click();
    await page.click('button:has-text("수강신청")');

    // Select virtual account payment
    await page.click('input[value="virtual_account"]');

    // Select bank
    await page.selectOption('select[name="bank"]', '신한은행');

    // Agree to terms
    await page.check('input[name="agreeTerms"]');

    // Click payment button
    await page.click('button:has-text("결제하기")');

    await page.waitForTimeout(2000);
    expect(page.url()).toMatch(/(checkout|payment|success)/);
  });

  test('should show payment success page', async ({ page }) => {
    // Simulate successful payment by navigating directly
    // In real scenario, this would be after actual payment
    await page.goto('/payment/success?orderId=TEST123&paymentKey=test_key&amount=50000');

    // Should display success message
    await expect(page.getByText(/결제가 완료되었습니다/i)).toBeVisible();
    await expect(page.getByText(/주문번호/i)).toBeVisible();

    // Should have button to go to my courses
    const myCoursesBtn = page.locator('button:has-text("내 강의실")');
    await expect(myCoursesBtn).toBeVisible();
  });

  test('should show payment failure page', async ({ page }) => {
    await page.goto('/payment/fail?code=PAYMENT_FAILED&message=Payment failed');

    // Should display error message
    await expect(page.getByText(/결제가 실패했습니다/i)).toBeVisible();

    // Should have button to retry
    const retryBtn = page.locator('button:has-text("다시 시도")');
    await expect(retryBtn).toBeVisible();
  });

  test('should add course to cart and checkout multiple courses', async ({ page }) => {
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');

    // Add first course to cart
    const firstCourse = page.locator('[data-testid="course-card"]').first();
    await firstCourse.hover();
    await firstCourse.locator('button:has-text("장바구니")').click();

    await expect(page.getByText(/장바구니에 추가되었습니다/i)).toBeVisible();

    // Add second course to cart
    const secondCourse = page.locator('[data-testid="course-card"]').nth(1);
    await secondCourse.hover();
    await secondCourse.locator('button:has-text("장바구니")').click();

    // Go to cart
    await page.click('[data-testid="cart-icon"]');
    await expect(page).toHaveURL(/.*\/cart/);

    // Should display both courses
    const cartItems = page.locator('[data-testid="cart-item"]');
    expect(await cartItems.count()).toBe(2);

    // Proceed to checkout
    await page.click('button:has-text("전체 구매하기")');
    await expect(page).toHaveURL(/.*\/checkout/);
  });

  test('should remove course from cart', async ({ page }) => {
    // First add a course to cart
    await page.goto('/courses');
    const firstCourse = page.locator('[data-testid="course-card"]').first();
    await firstCourse.hover();
    await firstCourse.locator('button:has-text("장바구니")').click();

    // Go to cart
    await page.click('[data-testid="cart-icon"]');

    // Remove course
    await page.click('button[aria-label="Remove from cart"]');

    // Should show empty cart message
    await expect(page.getByText(/장바구니가 비어있습니다/i)).toBeVisible();
  });

  test('should prevent checkout without agreeing to terms', async ({ page }) => {
    await page.goto('/courses');
    await page.locator('[data-testid="course-card"]').first().click();
    await page.click('button:has-text("수강신청")');

    // Select payment method
    await page.click('input[value="card"]');

    // Don't check terms agreement
    // Try to proceed with payment
    await page.click('button:has-text("결제하기")');

    // Should show validation error
    await expect(page.getByText(/약관에 동의해주세요/i)).toBeVisible();
  });

  test('should show already enrolled message', async ({ page }) => {
    // Navigate to a course that user is already enrolled in
    await page.goto('/courses');
    const enrolledCourse = page.locator('[data-testid="course-card"]:has-text("수강중")').first();

    if (await enrolledCourse.count() > 0) {
      await enrolledCourse.click();

      // Should show "이미 수강중" message instead of enroll button
      await expect(page.getByText(/이미 수강중인 강의입니다/i)).toBeVisible();
      await expect(page.locator('button:has-text("강의 보기")')).toBeVisible();
    }
  });
});
