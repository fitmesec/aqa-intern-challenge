import { expect, Page, test } from '@playwright/test';
import { WidgetPage } from './widget.page';

async function closeCookieBanner(page: Page) {
  const cookieBanner = page.locator('._UCHI_COOKIE__wrap');
  const cookieButton = page.locator('._UCHI_COOKIE__button');

  try {
    // Ждем баннер разумное время
    await cookieBanner.waitFor({ state: 'visible', timeout: 5000 });
    
    if (await cookieButton.isVisible()) {
      await cookieButton.click();
      await cookieBanner.waitFor({ state: 'hidden', timeout: 3000 });
    }
  } catch {
    // Если произошла ошибка (баннер не появился за 5 сек или не кликнулся),
    // принудительно удаляем его из DOM с помощью JS, чтобы исключить падения из-за перекрытия.
    await page.evaluate(() => {
      const banner = document.querySelector('._UCHI_COOKIE__wrap');
      if (banner) {
        banner.remove();
      }
    }).catch(() => {}); // Игнорируем ошибки контекста JS
  }
}

test.describe('Uchi.ru widget', () => {
  let widgetPage: WidgetPage;

  test.beforeEach(async ({ page }) => {
    widgetPage = new WidgetPage(page);

    await page.goto('/');
    
    // Дожидаемся, пока страница более-менее прогрузится, чтобы баннер успел отрендериться
    await page.waitForLoadState('domcontentloaded');
    
    await closeCookieBanner(page);
  });

  test('opens', async () => {
    await widgetPage.openWidget();
    await expect(widgetPage.getWidgetBody()).toBeVisible();
  });

  test('shows popular articles', async () => {
    await widgetPage.openWidget();
    const articles = await widgetPage.getPopularArticles();
    
    expect(articles.length).toBeGreaterThan(0);
    await expect(articles[0]).toBeVisible();
  });

  test('has correct title', async () => {
    await widgetPage.openWidget();
    
    const articles = await widgetPage.getPopularArticles();
    // force: true поможет, если статья тоже случайно перекрыта другим слоем
    await articles[0].click({ force: true });
    
    await widgetPage.clickWriteToUs();
    
    await expect(
      widgetPage.getWidgetBody().locator('header h5')
    ).toHaveText('Связь с поддержкой');
  });
});
