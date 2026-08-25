# @firefoxic/beautypography

[![License: MIT][license-image]][license-url]
[![Changelog][changelog-image]][changelog-url]
[![Test Status][test-image]][test-url]

Binds function words, numbers and em dashes in Markdown prose with non-breaking spaces, so that a line break never leaves an article, a preposition or a dash stranded at the end of a line.

It reads Markdown as Markdown: inline code spans and fenced code blocks are left exactly as their author wrote them, down to the spaces inside them.

The package has no runtime dependencies, and is not going to have any.

## Installation

### Globally

```shell
pnpm add -g @firefoxic/beautypography
```

### Locally

```shell
pnpm add -D @firefoxic/beautypography
```

Node 24.0 or newer.

## Usage

### On the command line

```shell
beautypography [options] [file...]
```

With no file given, every Markdown file below the current directory is bound, skipping the directories that belong to a tool rather than to the prose — `.claude`, `.git`, `coverage`, `dist`, `node_modules` and `tmp`, wherever in the tree they stand — and leaving the `LICENSE.md` of the root alone, since a license is quoted verbatim.

A file given by name is bound whatever it is called and wherever it lies: naming a file is asking for that file.

| Option | What it does |
|--------|--------------|
| `-c`, `--check` | Report the files that need binding instead of writing them |
| `-h`, `--help` | Print the usage |
| `-v`, `--version` | Print the version |

The command answers with `0` when there was nothing to do or everything was written, `1` when `--check` found prose that needs binding or an option was not understood, and `2` when a file could not be read or written. What went wrong is written to the error stream; what was bound, to the standard one.

### As a library

```js
import { bindProse } from "@firefoxic/beautypography"

let bound = bindProse("Read the docs of a kind — and more.")
```

`bindProse(source, language?)` applies the convention to a whole document and is what the command uses. It is idempotent: binding a bound document changes nothing.

For a single line, `bindLine(line, patterns)` takes a language already compiled by `createPatterns(language)` — compiling once and binding many lines is why the command is fast on a large document.

`ENGLISH` is the only language that ships. `toWords` splits a list of words written as indented prose, which is how the language file holds them. `NBSP` is the character everything above puts in.

The types `Language`, `Patterns` and `MaskedLine` are exported for anyone writing a language of their own.

## What gets bound

- **Function words** bind forward to the word that follows: articles, prepositions, coordinating and subordinating conjunctions, relative pronouns, particles, and numerals spelled out. Emphasis markers stay glued to the word, so `**not** ready` and `_not_ ready` bind as the word does.
- **Phrases and names** claim their spaces before any single word can, longest first, and only where they stand whole: `Keep a Changelog` is bound, while the opening of `Keep a Changelogs` is not. A name is matched as it is written, since the case of a name carries meaning.
- **Numbers** lean back on the word before them, and reach forward only when there is no such word to lean on: `version 2 of it` keeps its version, while the `5` of `the 5 files` goes to the files rather than to the article.
- **Em dashes** bind to the word before them, never to the line below.
- **Exceptions** are unbound again at the end, because the rules bind them but the meaning does not — `that is` and its like.

## Keeping prose bound

### In a pre-commit hook

```shell
beautypography --check $(git diff --cached --name-only --diff-filter=ACM | grep -E '\.md$')
```

### In CI

```yaml
- name: Check the prose
  run: pnpm dlx @firefoxic/beautypography --check
```

## Known limits

- **English only.** A second language is planned, and the matching logic is ready for one, but nothing else ships yet.
- **The word list is incomplete.** It covers the function words that break lines most visibly, not every one English has.
- **A code block indented by four spaces is prose to this tool.** Fenced blocks are recognised the way CommonMark writes them — backticks or tildes, any length, under an indent of up to three spaces — but telling an indented code block from a nested list item needs a full block parser.
- **Any word before a number takes it.** `see 5 files` binds the `5` back to `see`, where the number really counts the files. Telling a verb from a `version` needs to know parts of speech.

[license-url]: https://github.com/firefoxic/beautypography/blob/main/LICENSE.md
[license-image]: https://img.shields.io/badge/License-MIT-limegreen.svg

[changelog-url]: https://github.com/firefoxic/beautypography/blob/main/CHANGELOG.md
[changelog-image]: https://img.shields.io/badge/CHANGELOG-md-limegreen

[test-url]: https://github.com/firefoxic/beautypography/actions
[test-image]: https://github.com/firefoxic/beautypography/actions/workflows/test.yaml/badge.svg?branch=main
