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

	it(`binds a bound line to itself`, () => {
		let once = bind(`the word of a kind — and more`)

		expect(bind(once)).toBe(once)
	})

	it(`keeps emphasis markers glued to the word`, () => {
		expect(bind(`**not** ready`)).toBe(`**not**${NBSP}ready`)
	})

	it(`keeps an underscore emphasis glued to the word as well`, () => {
		expect(bind(`_not_ ready`)).toBe(`_not_${NBSP}ready`)
		expect(bind(`__the__ word`)).toBe(`__the__${NBSP}word`)
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

	it(`leaves a longer word a name only opens`, () => {
		expect(bind(`Keep a Changelogs of it`)).toBe(`Keep a${NBSP}Changelogs of${NBSP}it`)
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

	it(`binds a trailing number back to a word of any script`, () => {
		expect(bind(`siehe Abbildung 2.`)).toBe(`siehe Abbildung${NBSP}2.`)
	})

	it(`keeps a number with the word it counts from, whatever follows it`, () => {
		expect(bind(`version 2 of it`)).toBe(`version${NBSP}2 of${NBSP}it`)
		expect(bind(`chapter 3 covers it`)).toBe(`chapter${NBSP}3 covers it`)
	})

	it(`leaves a number to what it counts when a bound word stands before it`, () => {
		expect(bind(`the 5 files`)).toBe(`the${NBSP}5${NBSP}files`)
		expect(bind(`of 5 files`)).toBe(`of${NBSP}5${NBSP}files`)
	})

	it(`keeps a number written with a space between its groups whole`, () => {
		expect(bind(`10 000 items`)).toBe(`10${NBSP}000${NBSP}items`)
	})

	it(`leaves a version and a date alone`, () => {
		expect(bind(`v1.5 is out`)).toBe(`v1.5 is out`)
		expect(bind(`2024-01-05 was it`)).toBe(`2024-01-05 was it`)
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
