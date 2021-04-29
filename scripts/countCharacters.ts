import { Browser, launch, Page } from 'puppeteer';
import { Command } from 'commander';
import { partial } from 'lodash';

import { log } from 'fp-ts/lib/Console';
import { pipe, flow } from 'fp-ts/lib/function';
import { fold, none, Option, some } from 'fp-ts/lib/Option';
import { Task, chain, fromIO, of } from 'fp-ts/lib/Task';

import { IS_HEADLESS, LOGIN_ID, LOGIN_PAGE_URL, LOGIN_PASSWORD, SLOW_MOTION_MS, VIEW_PAGE_URL } from '../src/constants';
import { countArticleCharacters } from '../src/browser';
import { goToUrl, getPageFromBrowser, loginKnowledge, extractArticleContentsFromPage } from '../src/tasks';

const getOptions = () =>
  new Command()
    .requiredOption(
      `-n, --number [articleNumber]`, //
      'the number of the article you want to count',
    )
    .parse(process.argv)
    .opts();

const getArticleNumber = (): string => getOptions()['number'];

// write to standard output
const putStrLn: (s: string) => Task<void> = flow(log, fromIO);

const parse = (s: string): Option<number> => {
  const i = +s;
  return isNaN(i) || i % 1 !== 0 ? none : some(i);
};

const setViewPort: () => (page: Page) => Task<Page> = () => (page) => async () => {
  if (!IS_HEADLESS) {
    await page.setViewport({
      width: 1280,
      height: 800,
    });
  }
  return page;
};

const launchBrowser: () => Task<Browser> = () => () => launch({ headless: IS_HEADLESS, slowMo: SLOW_MOTION_MS });
const closeBrowser: () => <P extends Record<string, unknown>>(
  params: P & { browser: Browser },
) => Task<Omit<typeof params, 'browser'>> = () => (params) => async () => {
  const { browser, ...rest } = params;
  await browser.close();
  return rest;
};

/**
 * go to ${BASE_URL}/list
 */
const goToLoginPage = () => partial(goToUrl, LOGIN_PAGE_URL);
/**
 * go to ${BASE_URL}/view/${numberOfArticle}
 */
const goToArticlePage = (numberOfArticle: number) => partial(goToUrl, `${VIEW_PAGE_URL}/${numberOfArticle}`);
/**
 * login
 */
const login = () => partial(loginKnowledge, { id: LOGIN_ID, password: LOGIN_PASSWORD });

const extractArticleContents = () => extractArticleContentsFromPage;

const getArticleContents = (numberOfArticle: number) =>
  pipe(
    launchBrowser(),
    chain((browser) =>
      pipe(
        getPageFromBrowser(browser),
        chain(setViewPort()),
        chain(goToLoginPage()),
        chain(login()),
        chain(goToArticlePage(numberOfArticle)),
        chain(extractArticleContents()),
        chain((contents) => of({ browser, numberOfArticle, contents })),
      ),
    ),
    chain(closeBrowser()),
  );

const main = pipe(
  getArticleNumber(),
  parse,
  fold(() => {
    throw new Error('You should set an integer in the articleNumber option!');
  }, getArticleContents),
  chain(({ contents, numberOfArticle }) => {
    const length = countArticleCharacters(contents);
    return putStrLn(`#${numberOfArticle} Article has ${length} characters.`);
  }),
);

main();
