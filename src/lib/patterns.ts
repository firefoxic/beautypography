import type { Language, Patterns } from "./types.ts"

/** Either kind of space, since a phrase may already be bound. */
const SPACE = String.raw`[ \u00A0]`

/**
 * Escapes the words of a sequence and joins them by a space of either kind.
 *
 * The words are escaped one by one rather than the sequence at once, because an escaped space would no longer be the character class that lets a bound phrase match.
 *
 * @param {string} sequence - The words, separated by plain spaces.
 * @returns {string} The source of an expression matching them.
 */
function toSpacedSource (sequence: string): string {
	return sequence.split(` `).map((word) => RegExp.escape(word)).join(SPACE)
}

/**
 * Turns a sequence of words into an expression that matches it however its spaces are set.
 *
 * @param {string} phrase - The words, separated by plain spaces.
 * @returns {RegExp} The expression, anchored at both ends by a word boundary.
 */
function toPhrasePattern (phrase: string): RegExp {
	return new RegExp(String.raw`\b${toSpacedSource(phrase)}\b`, `giu`)
}

/**
 * Turns a name into an expression that matches it wherever it stands whole.
 *
 * A letter or a digit on either side is what a name may not touch, rather than a word boundary, so that a name is free to open or close on a character that is not one — a `C++`, a `.NET`. The case is not folded: a name is written the way it is written.
 *
 * @param {string} name - The name, its words separated by plain spaces.
 * @returns {RegExp} The expression.
 */
function toNamePattern (name: string): RegExp {
	return new RegExp(String.raw`(?<![\p{L}\p{N}])${toSpacedSource(name)}(?![\p{L}\p{N}])`, `gu`)
}

/**
 * Compiles a language into the expressions a line of prose is matched against.
 *
 * The words are tried longest first, so that `into` is never mistaken for `in`.
 *
 * A word may not follow a letter or a digit, rather than merely stand at a word boundary: an underscore is a word character, so `\b` would have refused the `_the_` a Markdown emphasis writes, while the trailing marker was allowed for all along.
 *
 * Everything a language gives is escaped on the way in. A language is data, and a word of it that reads as an expression — a `(`, an `a.c` — would either match what it never meant to or refuse to compile at all.
 *
 * @param {Language} language - The language to compile.
 * @returns {Patterns} The compiled expressions.
 */
export function createPatterns (language: Language): Patterns {
	let alternatives = language.boundWords.toSorted((a, b) => b.length - a.length).map((word) => RegExp.escape(word)).join(`|`)

	return {
		boundWord: new RegExp(String.raw`(?<![\p{L}\p{N}])(${alternatives})([*_]{0,2}) (?=\S)`, `giu`),
		boundPhrases: language.boundPhrases.map(toPhrasePattern),
		properNames: language.properNames.toSorted((a, b) => b.length - a.length).map((name) => toNamePattern(name)),
		exceptions: language.exceptions.map(toPhrasePattern),
	}
}
