import { Locator, Page } from '@playwright/test';

enum WidgetPageSelectors {
  WRAPPER = '.sc-dino-typography-h > [class^="widget__"]',
  WIDGET_BODY = '[class^="widgetWrapper"] > [class^="widget__"]',
  HEADER_TEXT = 'header h5',
  
  BUTTON_OPEN = '[data-test="openWidget"]',
  BUTTON_WRITE_TO_US = '[data-test="button_feedback_form"]',
  
  ARTICLE_POPULAR_TITLE = '[class^="popularTitle__"]',
  ARTICLE_POPULAR_LIST = `${ARTICLE_POPULAR_TITLE} + ul[class^="articles__"]`,
  ARTICLE_POPULAR_LIST_ITEM = `${ARTICLE_POPULAR_LIST} > li`,
}

export class WidgetPage {
  static selector = WidgetPageSelectors;

  constructor(protected page: Page) {}

  wrapper(): Locator {
    return this.page.locator(WidgetPage.selector.WRAPPER);
  }

  getWidgetBody(): Locator {
    return this.page.locator(WidgetPage.selector.WIDGET_BODY);
  }

  async openWidget() {
    if (await this.getWidgetBody().isVisible()) {
      return;
    }

    const openButton = this.page.locator(WidgetPage.selector.BUTTON_OPEN);
    await openButton.waitFor({ state: 'visible' });
    // Используем force на случай, если кнопка слегка перекрыта
    await openButton.click({ force: true });
  }

  async getPopularArticles(): Promise<Locator[]> {
    const items = this.wrapper().locator(WidgetPage.selector.ARTICLE_POPULAR_LIST_ITEM);
    
    // Ждем появления хотя бы первого элемента
    await items.first().waitFor({ state: 'visible' });
    
    return items.all();
  }

  async clickWriteToUs() {
    const writeToUsButton = this.page.locator(WidgetPage.selector.BUTTON_WRITE_TO_US);
    
    await writeToUsButton.waitFor({ state: 'visible' });
    // force: true игнорирует перекрывающие элементы (например, остатки куки-баннера)
    await writeToUsButton.click({ force: true });
  }

  async getTitle() {
    return this.wrapper()
      .locator(WidgetPage.selector.HEADER_TEXT)
      .textContent();
  }
}
