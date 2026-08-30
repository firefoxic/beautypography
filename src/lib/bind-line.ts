import { maskCodeSpans, unmaskCodeSpans } from "./code-spans.ts"
import { NBSP } from "./constants.ts"
import type { Patterns } from "./types.ts"

/** An em dash belongs to the word before it, never to the line below. */
const SPACED_EM_DASH = / — /gu

/**
 * Binds the words of a single line of prose.
 *
 * The rules run in an order that matters: code spans go out of reach first, whole phrases and names claim their spaces before any single word can, and the pairs the meaning keeps apart are unbound again at the very end.
 *
 * Every non-breaking space the line already carries is undone once the code spans are out of the way, which is what makes binding a bound line change nothing — and what keeps a space inside a code span exactly as its author set it.
 *
 * @param {string} line - The line to bind.
 * @param {Patterns} patterns - The compiled language to bind it by.
 * @returns {string} The same line with non-breaking spaces in place.
 */
export function bindLine (line: string, patterns: Patterns): string {
	let { masked, spans } = maskCodeSpans(line)

	masked = masked.replaceAll(NBSP, ` `)

	for (let name of patterns.properNames) {
		masked = masked.replaceAll(name, (match) => match.replaceAll(` `, NBSP))
	}

	for (let phrase of patterns.boundPhrases) {
		masked = masked.replaceAll(phrase, (match) => match.replaceAll(` `, NBSP))
	}

	masked = masked
		.replaceAll(patterns.boundWord, (_, word: string, emphasis: string) => `${word}${emphasis}${NBSP}`)
		.replaceAll(patterns.number, (match, word: string | undefined, number: string, space: string | undefined) => {
			if (word) return `${word}${NBSP}${number}${space ? NBSP : ``}`

			return space ? `${number}${NBSP}` : match
		})
		.replaceAll(SPACED_EM_DASH, `${NBSP}— `)

	for (let exception of patterns.exceptions) {
		masked = masked.replaceAll(exception, (match) => match.replaceAll(NBSP, ` `))
	}

	return unmaskCodeSpans(masked, spans)
}
