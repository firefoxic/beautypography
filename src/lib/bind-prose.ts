import { ENGLISH } from "./languages/english.ts"
import { bindLine } from "./bind-line.ts"
import { createPatterns } from "./patterns.ts"
import type { Language } from "./types.ts"

/** A fenced code block opens and closes with a line of its own: three or more backticks or tildes, under an indent of at most three spaces, and whatever the line carries after them. */
const FENCE = /^ {0,3}(`{3,}|~{3,})(.*)$/u

/**
 * Applies the convention to a whole document, leaving fenced code blocks alone.
 *
 * Undoing the non-breaking spaces the source already carries is left to `bindLine`, which does it once the code spans of a line are out of reach: a space inside a code span, or inside a fenced block, is the author's and stays as it is.
 *
 * A block is closed by a fence of its own character, no shorter than the one that opened it and carrying nothing but spaces after it — which is what keeps a shorter fence inside a longer one from ending the block early, and what lets a block opened by tildes ignore every backtick under it. A line of backticks whose remainder holds another backtick opens nothing: that is inline code, and it is prose.
 *
 * @param {string} source - The Markdown source.
 * @param {Language} language - The language its prose is written in.
 * @returns {string} The bound Markdown source.
 */
export function bindProse (source: string, language: Language = ENGLISH): string {
	let patterns = createPatterns(language)
	let bound: string[] = []
	let fence = ``

	for (let line of source.split(`\n`)) {
		let [, marker = ``, info = ``] = FENCE.exec(line) ?? []

		if (fence !== ``) {
			if (marker.charAt(0) === fence.charAt(0) && marker.length >= fence.length && info.trim() === ``) fence = ``

			bound.push(line)
		}
		else if (marker !== `` && !(marker.charAt(0) === `\`` && info.includes(`\``))) {
			fence = marker

			bound.push(line)
		}
		else bound.push(bindLine(line, patterns))
	}

	return bound.join(`\n`)
}
