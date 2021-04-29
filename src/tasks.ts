import { Page, ElementHandle, Browser } from 'puppeteer';
import { Task } from 'fp-ts/lib/Task';

import { ArticleContent, TagName } from './types';
import { articleContentHandler } from './browser';

export const _getPageFromBrowser = async (browser: Browser): Promise<Page> => {
  const pages = await browser.pages();
  const page = await (pages?.[0] ?? browser.newPage());
  await page.bringToFront();
  return page;
};

export const _goToUrl = async (url: string, page: Page): Promise<Page> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
  // NOTE: Because 401 will always be returned first
  // if (response.status() !== 200) {
  //   throw new Error(`goto ${url} failed`);
  // }
  return page;
};

export const _loginKnowledge = async (
  { id, password }: { id: string; password: string },
  knowledgeLoginPage: Page,
): Promise<Page> => {
  await knowledgeLoginPage.type('input[name="username"]', id);
  await knowledgeLoginPage.type('input[name="password"]', password);
  const submitButton = await knowledgeLoginPage.waitForXPath('//*[@id="content_top"]/div/form/div[3]/div/button', {
    timeout: 3000,
  });
  const [response] = await Promise.all([
    // The promise resolves after navigation has finished
    knowledgeLoginPage.waitForNavigation(),
    submitButton?.click(),
  ]);
  if (response?.status() !== 200) {
    throw new Error('login failed');
  }
  return knowledgeLoginPage;
};

export const _extractArticleContentsFromPage = async (articlePage: Page): Promise<ArticleContent[]> => {
  const contentHandle = await articlePage.evaluateHandle(articleContentHandler);
  const contentChildrenHandlers = Array.from(await contentHandle.getProperties())
    .map(([, property]) => property.asElement())
    .filter((elm): elm is ElementHandle<Element> => !!elm);

  return await Promise.all(
    contentChildrenHandlers.map((handler) =>
      handler.evaluate((elm: HTMLElement) => ({
        tagName: elm.tagName.toLocaleLowerCase() as TagName,
        innerText: elm.innerText,
      })),
    ),
  );
};

export const toTask = <P extends unknown[], R>(asyncFn: (...args: P) => Promise<R>): ((...args: P) => Task<R>) => (
  ...args
) => () => asyncFn(...args);

export const getPageFromBrowser = toTask(_getPageFromBrowser);
export const goToUrl = toTask(_goToUrl);
export const loginKnowledge = toTask(_loginKnowledge);
export const extractArticleContentsFromPage = toTask(_extractArticleContentsFromPage);
