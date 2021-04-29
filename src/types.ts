export type TagName = keyof HTMLElementTagNameMap;
export type ArticleContent = {
  tagName: TagName;
  innerText: string;
};
