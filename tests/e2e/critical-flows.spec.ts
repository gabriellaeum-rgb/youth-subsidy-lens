import { test, expect, type Page } from '@playwright/test';

/**
 * F0-AC0.3 / M12 — content column must be horizontally centered (equal left/right gap).
 * Uses document.documentElement.clientWidth, not page.viewportSize() — the latter
 * includes the scrollbar track, which alone creates a ~15px asymmetry that has nothing
 * to do with the centering CSS and would otherwise produce a false positive here.
 */
async function assertCentered(page: Page, selector: string) {
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  const box = await page.locator(selector).first().boundingBox();
  if (!box) throw new Error(`selector not found: ${selector}`);
  const leftGap = box.x;
  const rightGap = clientWidth - (box.x + box.width);
  expect(Math.abs(leftGap - rightGap)).toBeLessThanOrEqual(2);
}

/**
 * Clicks 다음 once per step from `fromStep` to `toStep`, confirming each transition via
 * the URL before firing the next click. Steps 3–8 share the exact accessible name
 * ("다음"/"지원금 보기"), so clicking it in a blind loop without waiting for the URL to
 * actually advance is a classic Playwright race — the click can fire again before the
 * app's own navigation for the previous click has committed.
 */
async function advanceSteps(page: Page, fromStep: number, toStep: number) {
  for (let s = fromStep; s < toStep; s++) {
    await page.getByRole('button', { name: '다음' }).click();
    await page.waitForURL(new RegExp(`step=${s + 1}(&|$|/)`));
  }
}

async function completeStep1And2(page: Page, sido: string, age: string) {
  await page.getByRole('radio', { name: sido }).click();
  await page.getByRole('button', { name: '다음' }).click();
  await page.waitForURL(/step=2/);
  await page.getByLabel('만 나이가 몇 살이에요?').fill(age);
  await page.getByRole('button', { name: '다음' }).click();
  await page.waitForURL(/step=3/);
}

test.describe('Critical flow A — happy path', () => {
  test('landing → 8 steps → results with reasons visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: '청년지원금렌즈' })).toBeVisible();
    await page.getByRole('button', { name: '지원금 확인하기' }).click();
    await page.waitForURL(/onboarding/);

    await completeStep1And2(page, '서울', '28');
    await advanceSteps(page, 3, 8);

    await page.getByRole('button', { name: '지원금 보기' }).click();

    await expect(page).toHaveURL(/\/results/);
    await expect(page.getByText(/총 \d+건이 매칭되었어요/)).toBeVisible();
    const reasonLabels = page.getByText('매칭 이유');
    await expect(reasonLabels.first()).toBeVisible();
  });
});

test.describe('Critical flow B — empty state (age out of range)', () => {
  test('age 45 shows age-out empty state and 온통청년 fallback', async ({ page }) => {
    await page.goto('/onboarding?step=1');
    await completeStep1And2(page, '서울', '45');
    await advanceSteps(page, 3, 8);
    await page.getByRole('button', { name: '지원금 보기' }).click();

    await expect(page.getByText('입력하신 프로필로 매칭된 프로그램이 없습니다.')).toBeVisible();
    await expect(page.getByText('청년 기본법 연령')).toBeVisible();
    const ontong = page.getByRole('link', { name: '온통청년에서 검색해보기' });
    await expect(ontong).toHaveAttribute('target', '_blank');
    await expect(ontong).toHaveAttribute('rel', /noopener/);
  });
});

test.describe('Critical flow C — M8 protected-class opt-in', () => {
  test('without 여성 opt-in, the women-only sample program never appears', async ({ page }) => {
    await page.goto('/onboarding?step=1');
    await completeStep1And2(page, '서울', '25');
    await advanceSteps(page, 3, 8);
    await page.getByRole('button', { name: '지원금 보기' }).click();

    await expect(page).toHaveURL(/\/results/);
    await expect(page.getByText('여성 예비창업 지원')).toHaveCount(0);
  });
});

test.describe('Regression — profile never appears in the URL (F0-AC0.2 / M11)', () => {
  test('finishing the wizard lands on /results with no query string', async ({ page }) => {
    await page.goto('/onboarding?step=1');
    await completeStep1And2(page, '서울', '28');
    await advanceSteps(page, 3, 8);
    await page.getByRole('button', { name: '지원금 보기' }).click();

    await expect(page).toHaveURL(/\/results/);
    expect(page.url()).not.toContain('?');
    expect(page.url()).not.toContain('sido=');
    expect(page.url()).not.toContain('age=');
  });
});

test.describe('Regression — content column centering (F0-AC0.3 / M12)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test('landing page header is centered', async ({ page }) => {
    await page.goto('/');
    await assertCentered(page, 'header');
  });

  test('about page content is centered', async ({ page }) => {
    await page.goto('/about');
    await assertCentered(page, 'header');
  });

  test('onboarding top bar is centered', async ({ page }) => {
    await page.goto('/onboarding?step=1');
    await assertCentered(page, '[class*="max-w-content"]');
  });
});

test.describe('Regression — inline Next button spacing (F1-AC1.14a)', () => {
  test('gap between last chip and Next button stays small on a short step', async ({ page }) => {
    await page.goto('/onboarding?step=1');
    await completeStep1And2(page, '서울', '28');

    const optionsBox = await page.getByRole('radiogroup').boundingBox();
    const buttonBox = await page.getByRole('button', { name: '다음' }).boundingBox();
    if (!optionsBox || !buttonBox) throw new Error('missing elements');
    const gap = buttonBox.y - (optionsBox.y + optionsBox.height);
    // Intentional design padding (content bottom padding + button-container top padding)
    // accounts for ~40-48px — the regression this guards against was 900-1100px.
    expect(gap).toBeLessThanOrEqual(64);
  });
});
