import type { Language, Patterns } from "./types.ts"

/** Either kind of space, since a phrase may already be bound. */
const SPACE = String.raw`[ \u00A0]`

/**
 * Turns a sequence of words into an expression that matches it however its spaces are set.
 *
 * @param {string} phrase - The words, separated by plain spaces.
 * @returns {RegExp} The expression, anchored at both ends by a word boundary.
 */
function toPhrasePattern (phrase: string): RegExp {
	return new RegExp(String.raw`\b${phrase.split(` `).join(SPACE)}\b`, `giu`)
}

/**
 * Compiles a language into the expressions a line of prose is matched against.
 *
 * The words are tried longest first, so that `into` is never mistaken for `in`.
 *
 * @param {Language} language - The language to compile.
 * @returns {Patterns} The compiled expressions.
 */
export function createPatterns (language: Language): Patterns {
	let alternatives = language.boundWords.toSorted((a, b) => b.length - a.length).join(`|`)

	return {
		boundWord: new RegExp(String.raw`\b(${alternatives})([*_]{0,2}) (?=\S)`, `giu`),
		boundPhrases: language.boundPhrases.map(toPhrasePattern),
		properNames: language.properNames.toSorted((a, b) => b.length - a.length),
		exceptions: language.exceptions.map(toPhrasePattern),
	}
}
