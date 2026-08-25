import { describe, expect, it } from "vitest"

import { ENGLISH } from "./languages/english.ts"
import { bindLine } from "./bind-line.ts"
import { NBSP } from "./constants.ts"
import { createPatterns } from "./patterns.ts"

let patterns = createPatterns(ENGLISH)

/**
 * Binds a line by the English patterns.
 *
 * @param {string} line - The line to bind.
 * @returns {string} The bound line.
 */
function bind (line: string): string {
	return bindLine(line, patterns)
}

describe(`bindLine`, () => {
	it(`binds an article to the word it opens`, () => {
		expect(bind(`the word`)).toBe(`the${NBSP}word`)
	})

	it(`binds forward only, never back`, () => {
		expect(bind(`of a kind and not less`)).toBe(`of${NBSP}a${NBSP}kind and${NBSP}not${NBSP}less`)
	})

	it(`binds a numeral spelled out`, () => {
		expect(bind(`three files`)).toBe(`three${NBSP}files`)
	})

	it(`prefers the longer word, so that "into" is never taken for "in"`, () => {
		expect(bind(`into place`)).toBe(`into${NBSP}place`)
	})

	it(`keeps emphasis markers glued to the word`, () => {
		expect(bind(`**not** ready`)).toBe(`**not**${NBSP}ready`)
	})

	it(`binds whatever the case`, () => {
		expect(bind(`The word`)).toBe(`The${NBSP}word`)
	})

	it(`leaves a word that merely ends in a bound word alone`, () => {
		expect(bind(`another word`)).toBe(`another word`)
		expect(bind(`brother in law`)).toBe(`brother in${NBSP}law`)
	})

	it(`keeps a phrase whole`, () => {
		expect(bind(`no longer here`)).toBe(`no${NBSP}longer here`)
	})

	it(`keeps a name of a work whole`, () => {
		expect(bind(`Keep a Changelog is a format`)).toBe(`Keep${NBSP}a${NBSP}Changelog is a${NBSP}format`)
	})

	it(`binds a number to what it counts`, () => {
		expect(bind(`5 files`)).toBe(`5${NBSP}files`)
		expect(bind(`1.5 times`)).toBe(`1.5${NBSP}times`)
	})

	it(`binds a trailing number backwards`, () => {
		expect(bind(`see figure 2.`)).toBe(`see figure${NBSP}2.`)
	})

	it(`binds an em dash to the word before it`, () => {
		expect(bind(`a word — and more`)).toBe(`a${NBSP}word${NBSP}— and${NBSP}more`)
	})

	it(`unbinds the pairs the meaning keeps apart`, () => {
		expect(bind(`that is enough`)).toBe(`that is enough`)
		expect(bind(`that says so`)).toBe(`that says so`)
		expect(bind(`hold on too long`)).toBe(`hold on too long`)
	})

	it(`reaches into no code span`, () => {
		expect(bind(`a \`the word\` here`)).toBe(`a${NBSP}\`the word\` here`)
	})

	it(`leaves a line with nothing to bind alone`, () => {
		expect(bind(`plain words only`)).toBe(`plain words only`)
	})
})
