import { readFileSync } from 'fs';
import { resolve } from 'path';
import { articleContentHandler } from '../src/browser';

describe('articleContentHandler', () => {
  let previousHtml = '';
  beforeAll(() => {
    previousHtml = document.body.innerHTML;
    const testHtml = readFileSync(resolve(__dirname, 'sample.html')).toString();
    document.body.innerHTML = testHtml;
  });

  afterAll(() => {
    document.body.innerHTML = previousHtml;
  });

  it('should return children elements', () => {
    // '^  <[a-z]'
    const elements = articleContentHandler();
    expect(elements.length).toBe(41);
  });
});
