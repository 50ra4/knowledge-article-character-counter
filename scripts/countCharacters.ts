import { Command } from 'commander';
import { partial } from 'lodash';
import { Browser } from 'puppeteer';

import { log } from 'fp-ts/lib/Console';
import * as F from 'fp-ts/lib/function';
import * as IO from 'fp-ts/lib/IO';
import * as Task from 'fp-ts/lib/Task';
import * as Either from 'fp-ts/lib/Either';
import * as TaskEither from 'fp-ts/lib/TaskEither';

import {
  DEFAULT_VIEW_PORT,
  DRAFT_VIEW_PAGE_URL,
  IS_HEADLESS,
  LOGIN_ID,
  LOGIN_PAGE_URL,
  LOGIN_PASSWORD,
  SLOW_MOTION_MS,
  VIEW_PAGE_URL,
} from '../src/constants';
import { countArticleCharacters } from '../src/browser';
import {
  goToUrl,
  getPageFromBrowser,
  loginKnowledge,
  extractArticleContentsFromPage,
  setViewPortToPage,
  launchBrowser,
  closeBrowser,
  showDraftPreview,
} from '../src/tasks';

const getOptions = () =>
  new Command()
    .requiredOption(
      `-n, --number [articleNumber]`, //
      'the number of the article you want to count',
    )
    .option(
      `-d, --draft`, //
      'if you want to count a draft article',
      false,
    )
    .parse(process.argv)
    .opts();

const getArticleNumber = (): string => getOptions()['number'];
const getIsDraft = (): boolean => !!getOptions()['draft'];

// write to standard output
const putStrLn: (s: string) => Task.Task<void> = F.flow(log, Task.fromIO);

const parseNumber = (s: string): Either.Either<Error, number> => {
  const i = +s;
  if (isNaN(i) || i % 1 !== 0) {
    return Either.left(new Error('You should set an integer in the articleNumber option.'));
  }
  return Either.right(i);
};

const parseArticleNumber = () => F.flow(parseNumber, TaskEither.fromEither);
const setViewPort = F.pipe(partial(setViewPortToPage, DEFAULT_VIEW_PORT, IS_HEADLESS), IO.of);

const launch = () => launchBrowser({ headless: IS_HEADLESS, slowMo: SLOW_MOTION_MS });
const shutdown: (browser: Browser) => <T>(result: Either.Either<Error, T>) => TaskEither.TaskEither<Error, T> = (
  browser,
) => (result) =>
  F.pipe(
    closeBrowser(browser),
    TaskEither.chain(() => TaskEither.fromEither(result)),
  );

/**
 * go to sign in page
 */
const goToLoginPage = () => partial(goToUrl, LOGIN_PAGE_URL);
/**
 * go to article page
 */
const goToArticlePage = (numberOfArticle: number) => partial(goToUrl, `${VIEW_PAGE_URL}/${numberOfArticle}`);
/**
 * go to draft article page
 */
const goToDraftArticlePage = (numberOfArticle: number) => partial(goToUrl, `${DRAFT_VIEW_PAGE_URL}/${numberOfArticle}`);

/**
 * login
 */
const login = () => partial(loginKnowledge, { id: LOGIN_ID, password: LOGIN_PASSWORD });

const extractArticleContents = () => extractArticleContentsFromPage;

const showPreviewArticle = () => showDraftPreview;

const getArticleContents = () => (numberOfArticle: number) =>
  F.pipe(
    launch(),
    TaskEither.chain((browser) =>
      F.pipe(
        getPageFromBrowser(browser),
        TaskEither.chain(setViewPort()),
        TaskEither.chain(goToLoginPage()),
        TaskEither.chain(login()),
        TaskEither.chain(goToArticlePage(numberOfArticle)),
        TaskEither.chain(extractArticleContents()),
        TaskEither.chain((contents) => TaskEither.of({ numberOfArticle, contents })),
        Task.chain(shutdown(browser)),
      ),
    ),
  );

const getDraftArticleContents = () => (numberOfArticle: number) =>
  F.pipe(
    launch(),
    TaskEither.chain((browser) =>
      F.pipe(
        getPageFromBrowser(browser),
        TaskEither.chain(setViewPort()),
        TaskEither.chain(goToLoginPage()),
        TaskEither.chain(login()),
        TaskEither.chain(goToDraftArticlePage(numberOfArticle)),
        TaskEither.chain(showPreviewArticle()),
        TaskEither.chain(extractArticleContents()),
        TaskEither.chain((contents) => TaskEither.of({ numberOfArticle, contents })),
        Task.chain(shutdown(browser)),
      ),
    ),
  );

const main = F.pipe(
  getArticleNumber(),
  parseArticleNumber(),
  TaskEither.chain(getIsDraft() ? getDraftArticleContents() : getArticleContents()),
  TaskEither.chain(({ contents, numberOfArticle }) => {
    const length = countArticleCharacters(contents);
    return TaskEither.of(`#${numberOfArticle} Article has ${length} characters.`);
  }),
  TaskEither.fold((err) => Task.of(err.message), Task.of),
  Task.chain((message) => putStrLn(message)),
);

main();
