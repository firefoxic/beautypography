import { describe, expect, it } from "vitest"

import { ENGLISH } from "./english.ts"

describe(`ENGLISH`, () => {
	it(`gathers every group into one list of words`, () => {
		expect(ENGLISH.boundWords).toContain(`the`)
		expect(ENGLISH.boundWords).toContain(`through`)
		expect(ENGLISH.boundWords).toContain(`although`)
		expect(ENGLISH.boundWords).toContain(`which`)
		expect(ENGLISH.boundWords).toContain(`not`)
		expect(ENGLISH.boundWords).toContain(`twelve`)
	})

	it(`repeats no word between the groups`, () => {
		expect(new Set(ENGLISH.boundWords).size).toBe(ENGLISH.boundWords.length)
	})

	it(`holds no empty word`, () => {
		expect(ENGLISH.boundWords.every((word) => (/^[a-z]+$/u).test(word))).toBe(true)
	})
})
