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

1. `code-spans.ts` lifts every inline code span out of the line behind a private-use placeholder, so no later rule can reach inside one.
2. Proper names, then multi-word phrases, claim their spaces first — longest name first, so a shorter name never eats a longer one.
3. Single bound words, then numbers forward, then a trailing number backwards, then the em dash.
4. The exception pairs are unbound again at the very end, because the rules bind them but the meaning does not.
5. The code spans go back.

`bind-prose.ts` wraps that for a document: it undoes every non-breaking space in the source first, which is what makes the transform idempotent, and toggles a fenced-code flag on lines that open with three backticks.

`patterns.ts` compiles a `Language` into the expressions a line is matched against, once per document rather than once per line.

### Language data

`src/lib/languages/english.ts` holds the words in named groups — articles, prepositions, coordinating and subordinating conjunctions, relative pronouns, particles, numerals — written as indented prose and split by `to-words.ts`. Keep them that way: one flat array is explicitly not wanted, and the groups are the documentation. Only `ENGLISH` is exported; the groups are assembled into it at the bottom of the file.

A second language (Russian is planned, far out) should be a sibling file exporting another `Language`, with no change to the matching logic. Anything language-independent — the number rules, the em dash — stays in `bind-line.ts` and out of the language files.

The word coverage is known to be incomplete, and `properNames` currently carries two names that really belong to a project's configuration rather than to English. Both are open questions, not settled design.

### CLI

`cli.ts` is the shebang and nothing else. `main.ts` holds the whole command and takes its writer as an argument rather than reaching for `stdout`, so the tests read what it printed without mocking. `arguments.ts` parses `argv` into a plain object and collects options it does not know instead of guessing. `paths.ts` walks the tree and skips tool directories at any depth.

## Conventions

- Tests sit next to the code as `*.test.ts` — never a separate top-level test directory. `src/**/types.ts` and `src/bin/cli.ts` are excluded from coverage.
- Relative imports carry the `.ts` extension (`allowImportingTsExtensions` plus `rewriteRelativeImportExtensions`); `tsc`, vitest, tsdown and bare `node` all resolve them.
- `isolatedDeclarations` is on: every exported symbol needs an explicit return or value type.
- The lint config (`@firefoxic/oxlint-config`) is strict in ways worth knowing before writing a line: backtick string literals only, `let` for anything not a top-level SCREAM_CASE constant, function declarations rather than expressions, exports last in the file, sorted import groups separated by blank lines, and JSDoc with `{type}` on every `@param` and `@returns` even in TypeScript.
- Every `.md` in the repo is bound by the package itself, so run `make prose` after editing one.
