import { test, expect } from '@playwright/test';

test.describe('Critical flow A — happy path', () => {
  test('landing → 8 steps → results with reasons visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: '청년지원금렌즈' })).toBeVisible();
    await page.getByRole('button', { name: '지원금 확인하기' }).click();

    await page.getByRole('radio', { name: '서울' }).click();
    await page.getByRole('button', { name: '다음' }).click();

    await page.getByLabel('만 나이가 몇 살이에요?').fill('28');
    await page.getByRole('button', { name: '다음' }).click();

    for (let i = 0; i < 5; i++) {
      await page.getByRole('button', { name: '다음' }).click();
    }

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
    await page.getByRole('radio', { name: '서울' }).click();
    await page.getByRole('button', { name: '다음' }).click();
    await page.getByLabel('만 나이가 몇 살이에요?').fill('45');
    await page.getByRole('button', { name: '다음' }).click();
    for (let i = 0; i < 5; i++) {
      await page.getByRole('button', { name: '다음' }).click();
    }
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
    await page.getByRole('radio', { name: '서울' }).click();
    await page.getByRole('button', { name: '다음' }).click();
    await page.getByLabel('만 나이가 몇 살이에요?').fill('25');
    await page.getByRole('button', { name: '다음' }).click();
    for (let i = 0; i < 5; i++) {
      await page.getByRole('button', { name: '다음' }).click();
    }
    await page.getByRole('button', { name: '지원금 보기' }).click();

    await expect(page).toHaveURL(/\/results/);
    await expect(page.getByText('[샘플] 여성 예비창업 지원')).toHaveCount(0);
  });
});
