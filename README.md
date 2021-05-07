knowledge-article-character-counter
====

## Description

This is a console application that counts the number of characters in articles created in the [Free Knowledge Base System](https://information-knowledge.support-project.org/ja/).

## Requirement

- Install node.js(14.16.0)

## Usage

1. Execute `git clone`.

```bash
$ git clone $CREATED_NEW_REPOSITORY_URL
```

2. Install `npm packages`.

```bash
$ npm install
```

3. create `.env` file with reference to [.env.sample](./.env.sample)

e.g.
```
BASE_URL = https://knowledge.exemple.com // url
ID = s.igarashi@exemple.com // login id
PASSWORD = 123456 // login password
IS_HEADLESS = 1 // set it to 0 if you want to display the browser and see the execution.
```

4. count the number of characters in target article.

```bash
$ npm run count-article-character -- -n $TARGET_NUMBER_OR_ARTICLE
```

e.g.
```bash
$ npm run count-article-character -- -n 358
```

Please specify the draft option if you want to count draft article.

```bash
$ npm run count-article-character -- -n $TARGET_NUMBER_OR_ARTICLE -d
```

## Install

- node.js（14.16.0）

## Licence

[MIT](./LICENSE)

## Author

[s.igarashi](https://github.com/50ra4)
