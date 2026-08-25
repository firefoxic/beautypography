import { ENGLISH } from "./languages/english.ts"
import { bindLine } from "./bind-line.ts"
import { NBSP } from "./constants.ts"
import { createPatterns } from "./patterns.ts"
import type { Language } from "./types.ts"

/** A fenced code block opens and closes with a line of its own. */
const FENCE = `\`\`\``

/**
 * Applies the convention to a whole document, leaving fenced code blocks alone.
 *
 * Every non-breaking space already in the source is undone first, so that binding a bound document changes nothing.
 *
 * @param {string} source - The Markdown source.
 * @param {Language} language - The language its prose is written in.
 * @returns {string} The bound Markdown source.
 */
export function bindProse (source: string, language: Language = ENGLISH): string {
	let patterns = createPatterns(language)
	let isFenced = false

	return source.replaceAll(NBSP, ` `).split(`\n`).map((line) => {
		if (line.startsWith(FENCE)) {
			isFenced = !isFenced

			return line
		}

		return isFenced ? line : bindLine(line, patterns)
	}).join(`\n`)
}
