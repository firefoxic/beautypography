# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this package is

`@firefoxic/beautypography` binds function words, numbers and em dashes in Markdown prose with non-breaking spaces. It ships a library entry point and a hand-written executable. It has no runtime dependencies and must never gain one — the CLI parses its own arguments and walks the tree itself.

## Commands

Everything runs through the `Makefile` (`node_modules/.bin` is already on `PATH` inside it):

- `make help` — list every target
- `make check` — `tsc --noEmit`
- `make lint` — oxlint; narrow with `make lint FILE=src/lib/patterns.ts` or pass `LINT_FLAGS=--fix`
- `make test` — vitest, single run (watch is off in `vitest.config.ts`)
- `make test FILE=src/lib/bind-line.test.ts` — one file; `TEST_FLAGS='-t "binds an article"'` for one case; `TEST_FLAGS=--coverage` for the report
- `make build` — bundle into `dist/` with tsdown (it grants the executable bit to `dist/bin/cli.js` itself)
- `make prose` / `make prose-check` — run this package's own binder over the repo's Markdown, from source
- `make verify` — `check lint test prose-check`, exactly what CI runs

The pre-commit hook lints and runs `vitest related` on staged `.js`/`.ts` files.

## Architecture

`src/lib/` is pure text: no filesystem, no `process`. `src/bin/` is everything that touches the world.

The transformation is a pipeline whose order is load-bearing, and `bind-line.ts` is where that order lives:

1. `code-spans.ts` lifts every inline code span out of the line behind a private-use placeholder, so no later rule can reach inside one. The non-breaking spaces the line already carries are undone right after, which is what makes the transform idempotent — and what leaves the spaces inside a span exactly as their author set them.
2. Proper names, then multi-word phrases, claim their spaces first — longest name first, so a shorter name never eats a longer one.
3. Single bound words, then the number rule, then the em dash. A number is one rule rather than two: it leans back on the word before it when that word is not a bound one, and reaches forward otherwise, since the two answers are exclusive.
4. The exception pairs are unbound again at the very end, because the rules bind them but the meaning does not.
5. The code spans go back.

`bind-prose.ts` wraps that for a document, holding fenced code blocks apart from the prose. It remembers what opened a block rather than merely that something did — the character and the length of the fence — so that a block closes on a fence of its own character, no shorter than the one that opened it and carrying nothing after it, the way CommonMark writes one.

`patterns.ts` compiles a `Language` into the expressions a line is matched against, once per document rather than once per line.

### Language data

`src/lib/languages/english.ts` holds the words in named groups — articles, prepositions, coordinating and subordinating conjunctions, relative pronouns, particles, numerals — written as indented prose and split by `to-words.ts`. Keep them that way: one flat array is explicitly not wanted, and the groups are the documentation. Only `ENGLISH` is exported; the groups are assembled into it at the bottom of the file.

A second language (Russian is planned, far out) should be a sibling file exporting another `Language`, with no change to the matching logic. The em dash stays in `bind-line.ts`, where nothing about a language is needed to place it. The number rule is compiled per language in `patterns.ts`, because it has to know which words are bound ones: a number leans back on the word before it, and `version 2` must hold while the `5` of `the 5 files` belongs to the files rather than to the article.

The word coverage is known to be incomplete, and `properNames` currently carries two names that really belong to a project's configuration rather than to English. Both are open questions, not settled design.

### CLI

`cli.ts` is the shebang and nothing else. `main.ts` holds the whole command and takes its writer as an argument rather than reaching for `stdout`, so the tests read what it printed without mocking. `arguments.ts` parses `argv` into a plain object and collects options it does not know instead of guessing. `paths.ts` walks the tree one directory at a time, declining to descend into a tool directory rather than dropping it out of the result afterwards — `readdirSync` takes no list of subtrees to leave unread, and reading `node_modules` in full is both the slow way and the one that fails on an entry it was never meant to open.

## Conventions

- Tests sit next to the code as `*.test.ts` — never a separate top-level test directory. `src/**/types.ts` and `src/bin/cli.ts` are excluded from coverage.
- Relative imports carry the `.ts` extension (`allowImportingTsExtensions` plus `rewriteRelativeImportExtensions`); `tsc`, vitest, tsdown and bare `node` all resolve them.
- `isolatedDeclarations` is on: every exported symbol needs an explicit return or value type.
- The lint config (`@firefoxic/oxlint-config`) is strict in ways worth knowing before writing a line: backtick string literals only, `let` for anything not a top-level SCREAM_CASE constant, function declarations rather than expressions, exports last in the file, sorted import groups separated by blank lines, and JSDoc with `{type}` on every `@param` and `@returns` even in TypeScript.
- Every `.md` in the repo is bound by the package itself, so run `make prose` after editing one.
