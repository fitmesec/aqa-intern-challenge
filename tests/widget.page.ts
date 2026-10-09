import {Page} from "@playwright/test";

enum WidgetPageSelectors {
    WRAPPER = '.sc-dino-typography-h > [class^=widget__]',
    WIDGET_BODY = '[class^=widgetWrapper] > [class^=widget__]',
    HEADER_TEXT = 'header h5',
    BUTTON_OPEN = '[data-test=openWidget]',
    BUTTON_WRITE_TO_US = '[data-test=button_feedback_form]',
    ARTICLE_POPULAR_TITLE = '[class^=popularTitle__]',
    ARTICLE_POPULAR_LIST = `${ARTICLE_POPULAR_TITLE} + ul[class^=articles__]`,
    ARTICLE_POPULAR_LIST_ITEM = `${ARTICLE_POPULAR_LIST} > li`,
}

export class WidgetPage {
    static selector = WidgetPageSelectors;

    constructor(protected page: Page) {}

    wrapper() {
        return this.page.locator(WidgetPage.selector.WRAPPER)
    }

    async openWidget() {
        // the widget remembers whether it was left open from a previous run,
        // so the open button may already be hidden - in that case there's
        // nothing to click
        if (await this.getWidgetBody().isVisible()) {
            return;
        }

        await this.wrapper().locator(WidgetPage.selector.BUTTON_OPEN).click();
    }

    async getPopularArticles() {
        const items = this.wrapper().locator(WidgetPage.selector.ARTICLE_POPULAR_LIST_ITEM);
        // the list comes from an async API call, so wait for it to load
        // instead of reading it immediately
        await items.first().waitFor();
        return items.all();
    }

    async clickWriteToUs() {
        return this.wrapper().locator(WidgetPage.selector.BUTTON_WRITE_TO_US).click();
    }

    async getTitle() {
        return this.wrapper().locator(WidgetPage.selector.HEADER_TEXT).textContent();
    }

    getWidgetBody() {
        return this.page.locator(WidgetPage.selector.WIDGET_BODY);
    }
}
