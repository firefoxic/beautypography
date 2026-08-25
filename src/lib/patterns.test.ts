import { describe, expect, it } from "vitest"

import { ENGLISH } from "./languages/english.ts"
import { createPatterns } from "./patterns.ts"

describe(`createPatterns`, () => {
	it(`sorts the names of works longest first`, () => {
		let { properNames } = createPatterns({ ...ENGLISH, properNames: [`Ada`, `Ada Lovelace`] })

		expect(properNames).toEqual([`Ada Lovelace`, `Ada`])
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
