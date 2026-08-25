import { describe, expect, it } from "vitest"

import { toWords } from "./to-words.ts"

describe(`toWords`, () => {
	it(`splits a list written over several indented lines`, () => {
		expect(toWords(`
			a an
			the
		`)).toEqual([`a`, `an`, `the`])
	})

	it(`keeps the order it was written in`, () => {
		expect(toWords(`the a an`)).toEqual([`the`, `a`, `an`])
	})
})
