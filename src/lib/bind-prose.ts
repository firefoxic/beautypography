import { ENGLISH } from "./languages/english.ts"
import { bindLine } from "./bind-line.ts"
import { createPatterns } from "./patterns.ts"
import type { Language } from "./types.ts"

/** A fenced code block opens and closes with a line of its own. */
const FENCE = `\`\`\``

/**
 * Applies the convention to a whole document, leaving fenced code blocks alone.
 *
 * Undoing the non-breaking spaces the source already carries is left to `bindLine`, which does it once the code spans of a line are out of reach: a space inside a code span, or inside a fenced block, is the author's and stays as it is.
 *
 * @param {string} source - The Markdown source.
 * @param {Language} language - The language its prose is written in.
 * @returns {string} The bound Markdown source.
 */
export function bindProse (source: string, language: Language = ENGLISH): string {
	let patterns = createPatterns(language)
	let isFenced = false

	return source.split(`\n`).map((line) => {
		if (line.startsWith(FENCE)) {
			isFenced = !isFenced

			return line
		}

		return isFenced ? line : bindLine(line, patterns)
	}).join(`\n`)
}
