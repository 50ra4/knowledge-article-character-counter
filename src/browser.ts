import { TagName, ArticleContent } from './types';

export const articleContentHandler = (): HTMLElement[] =>
  Array.from(document.querySelector('#content')?.children ?? []) as HTMLElement[];

const EXCLUDED_TAG_NAMES: ReadonlyArray<TagName> = ['pre'];
export const shouldIncludeTagName = (tagName: TagName): boolean => !EXCLUDED_TAG_NAMES.includes(tagName);

export const countArticleCharacters = (contents: ArticleContent[]): number =>
  contents
    .filter(({ tagName }) => shouldIncludeTagName(tagName))
    .map(({ innerText }) => innerText)
    .map((text) => text.replace('\n', ''))
    .join('').length;
