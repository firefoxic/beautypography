import type { MaskedLine } from "./types.ts"

/** An inline code span of any backtick width. */
const CODE_SPAN = /(`+)(?:(?!\1)[\s\S])*?\1/gu

/** A span stands in as its index between two private-use characters, which prose never contains. */
const MARKER = `\uE000`

/** The stand-in a masked span left behind. */
const PLACEHOLDER = /\uE000(\d+)\uE000/gu

/**
 * Takes the inline code spans out of a line, so that no rule can reach inside one.
 *
 * @param {string} line - The line to mask.
 * @returns {MaskedLine} The masked line together with the spans that were taken out.
 */
export function maskCodeSpans (line: string): MaskedLine {
	let spans: string[] = []
	let masked = line.replaceAll(CODE_SPAN, (span) => `${MARKER}${spans.push(span) - 1}${MARKER}`)

	return { masked, spans }
}

/**
 * Puts the code spans back where their placeholders stand.
 *
 * @param {string} masked - The masked line, bound by now.
 * @param {string[]} spans - The spans that were taken out of it.
 * @returns {string} The line with its code spans restored.
 */
export function unmaskCodeSpans (masked: string, spans: string[]): string {
	return masked.replaceAll(PLACEHOLDER, (_, index: string) => spans[Number(index)] ?? ``)
}
