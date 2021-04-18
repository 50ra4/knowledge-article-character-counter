import { launch, Page } from 'puppeteer';
import { join } from 'path';
import { Command } from 'commander';

import { log } from 'fp-ts/lib/Console';
import { pipe, flow } from 'fp-ts/lib/function';
import { fold, none, Option, some } from 'fp-ts/lib/Option';
import { Task, chain, fromIO, of } from 'fp-ts/lib/Task';

import {
  IS_HEADLESS,
  LOGIN_ID,
  LOGIN_PASSWORD,
  BASE_URL,
  getPage,
  goToUrl,
  loginKnowledge,
  getArticleContents,
  countArticleCharacters,
} from '../src';

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

const parse = (s: string): Option<string> => {
  const i = +s;
  return isNaN(i) || i % 1 !== 0 ? none : some(s);
};

const setViewPort = (page: Page): Task<Page> => async () => {
  if (!IS_HEADLESS) {
    await page.setViewport({
      width: 1280,
      height: 800,
    });
  }
  return page;
};

/**
 * go to ${BASE_URL}/list
 */
const goToLoginPage = goToUrl(join(BASE_URL, 'list'));
/**
 * go to ${BASE_URL}/view/${numberOfArticle}
 */
const goToArticlePage = (numberOfArticle: string) => goToUrl(join(BASE_URL, 'view', numberOfArticle));
const countCharacters = flow(countArticleCharacters, of);

const getArticleCharacters = (numberOfArticle: string) =>
  pipe(
    () => launch({ headless: IS_HEADLESS, slowMo: IS_HEADLESS ? undefined : 50 }),
    chain((browser) =>
      pipe(
        getPage(browser),
        chain(setViewPort),
        chain(goToLoginPage),
        chain(loginKnowledge({ id: LOGIN_ID, password: LOGIN_PASSWORD })),
        chain(goToArticlePage(numberOfArticle)),
        chain(getArticleContents),
        chain(countCharacters),
        chain((textLength) => of({ browser, textLength })),
      ),
    ),
    chain(({ browser, ...rest }) => async () => {
      await browser.close();
      return { ...rest, numberOfArticle };
    }),
  );

const main = pipe(
  getArticleNumber(),
  parse,
  fold(() => {
    putStrLn('You did not set an integer in the articleNumber option!');
    throw new Error('option is not integer!');
  }, getArticleCharacters),
  chain(({ textLength, numberOfArticle }) => putStrLn(`#${numberOfArticle} Article has ${textLength} characters.`)),
);

main();
