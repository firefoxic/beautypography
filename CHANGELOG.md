<!-- markdownlint-disable MD007 MD024 -->
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com), and this project adheres to [Semantic Versioning](https://semver.org).

## [Unreleased]

## [0.1.1] — 2026–08–30

### Fixed

- A number is bound on both sides, and never to a function word: `cost 0.05 ms` no longer breaks between the measurement and its unit, and `measuring 8 + 13` no longer lets the `+` open a line, while `version 2 of it` still keeps its version and lets the `of` go ([#1](https://github.com/firefoxic/beautypography/issues/1)).

## [0.1.0] — 2026–08–25

### Added

- The `beautypography` command: binds every Markdown file below the current directory, or the files it is given, and reports what needs binding under `--check`.
- The library entry point: `bindProse` for a document, `bindLine` for a line, `createPatterns` for a language, and the English language data.

[Unreleased]: https://github.com/firefoxic/beautypography/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/firefoxic/beautypography/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/firefoxic/beautypography/compare/v0.0.1...v0.1.0
