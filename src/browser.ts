import { Page, ElementHandle, Browser } from 'puppeteer';
import { Task } from 'fp-ts/lib/Task';
import { ArticleContent, TagName } from './types';

export const getPage = (browser: Browser): Task<Page> => async () => {
  const pages = await browser.pages();
  const page = await (pages?.[0] ?? browser.newPage());
  await page.bringToFront();
  return page;
};

export const goToUrl = (url: string) => (page: Page): Task<Page> => async () => {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  return page;
};

export const loginKnowledge = ({ id, password }: { id: string; password: string }) => (
  knowledgeLoginPage: Page,
): Task<Page> => async () => {
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

export const articleContentHandler = (): HTMLElement[] =>
  Array.from(document.querySelector('#content')?.children ?? []) as HTMLElement[];

export const getArticleContents = (articlePage: Page): Task<ArticleContent[]> => async () => {
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

const EXCLUDED_TAG_NAMES: ReadonlyArray<TagName> = ['pre'];
export const shouldIncludeTagName = (tagName: TagName): boolean => !EXCLUDED_TAG_NAMES.includes(tagName);

export const countArticleCharacters = (contents: ArticleContent[]): number =>
  contents
    .filter(({ tagName }) => shouldIncludeTagName(tagName))
    .map(({ innerText }) => innerText)
    .map((text) => text.replace('\n', ''))
    .join('').length;
