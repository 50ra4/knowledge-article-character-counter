import { Command } from 'commander';
import { partial } from 'lodash';

import { log } from 'fp-ts/lib/Console';
import * as F from 'fp-ts/lib/function';
import * as Option from 'fp-ts/lib/Option';
import * as Task from 'fp-ts/lib/Task';

import { IS_HEADLESS, LOGIN_ID, LOGIN_PAGE_URL, LOGIN_PASSWORD, SLOW_MOTION_MS, VIEW_PAGE_URL } from '../src/constants';
import { countArticleCharacters } from '../src/browser';
import {
  goToUrl,
  getPageFromBrowser,
  loginKnowledge,
  extractArticleContentsFromPage,
  setViewPortToPage,
  launchBrowser,
  closeBrowser,
} from '../src/tasks';

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
const putStrLn: (s: string) => Task.Task<void> = F.flow(log, Task.fromIO);

const parse = (s: string): Option.Option<number> => {
  const i = +s;
  return isNaN(i) || i % 1 !== 0 ? Option.none : Option.some(i);
};

const setViewPort = () =>
  partial(
    setViewPortToPage,
    {
      width: 1280,
      height: 800,
    },
    IS_HEADLESS,
  );

const launch = () => launchBrowser({ headless: IS_HEADLESS, slowMo: SLOW_MOTION_MS });
const shutdown = () => closeBrowser;

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
  F.pipe(
    launch(),
    Task.chain((browser) =>
      F.pipe(
        getPageFromBrowser(browser),
        Task.chain(setViewPort()),
        Task.chain(goToLoginPage()),
        Task.chain(login()),
        Task.chain(goToArticlePage(numberOfArticle)),
        Task.chain(extractArticleContents()),
        Task.chain((contents) => Task.of({ browser, numberOfArticle, contents })),
      ),
    ),
    Task.chain(shutdown()),
  );

const main = F.pipe(
  getArticleNumber(),
  parse,
  Option.fold(() => {
    throw new Error('You should set an integer in the articleNumber option!');
  }, getArticleContents),
  Task.chain(({ contents, numberOfArticle }) => {
    const length = countArticleCharacters(contents);
    return putStrLn(`#${numberOfArticle} Article has ${length} characters.`);
  }),
);

main();
