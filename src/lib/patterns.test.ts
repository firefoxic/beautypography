import { describe, expect, it } from "vitest"

import { ENGLISH } from "./languages/english.ts"
import { bindLine } from "./bind-line.ts"
import { NBSP } from "./constants.ts"
import { createPatterns } from "./patterns.ts"

describe(`createPatterns`, () => {
	it(`sorts the names of works longest first, so that a name never eats a shorter one`, () => {
		let { properNames } = createPatterns({ ...ENGLISH, properNames: [`Ada`, `Ada Lovelace`] })

		expect(properNames.map((name) => name.source)).toEqual([
			String.raw`(?<![\p{L}\p{N}])\x41da[ \u00A0]\x4covelace(?![\p{L}\p{N}])`,
			String.raw`(?<![\p{L}\p{N}])\x41da(?![\p{L}\p{N}])`,
		])
	})

	it(`matches a name as it is written, and only where it stands whole`, () => {
		let patterns = createPatterns({ ...ENGLISH, properNames: [`Ada Lovelace`] })

		expect(bindLine(`Ada Lovelace`, patterns)).toBe(`Ada${NBSP}Lovelace`)
		expect(bindLine(`ada lovelace`, patterns)).toBe(`ada lovelace`)
		expect(bindLine(`Ada Lovelaces`, patterns)).toBe(`Ada Lovelaces`)
	})

	it(`escapes what a language gives it`, () => {
		let patterns = createPatterns({ ...ENGLISH, boundWords: [`a.c`] })

		expect(bindLine(`a.c d`, patterns)).toBe(`a.c${NBSP}d`)
		expect(bindLine(`abc d`, patterns)).toBe(`abc d`)
	})

	it(`compiles a word that reads as an expression rather than refusing it`, () => {
		expect(() => createPatterns({ ...ENGLISH, boundWords: [`(`] })).not.toThrow()
	})

	it(`matches a phrase that is already bound`, () => {
		let [phrase] = createPatterns({ ...ENGLISH, boundPhrases: [`no longer`] }).boundPhrases

		expect(phrase?.test(`no longer`)).toBe(true)
	})

	it(`builds one expression per exception`, () => {
		let { exceptions } = createPatterns(ENGLISH)

		expect(exceptions).toHaveLength(ENGLISH.exceptions.length)
	})
})
