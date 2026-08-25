import { describe, expect, it } from "vitest"

import { bindProse } from "./bind-prose.ts"
import { NBSP } from "./constants.ts"

/** A document with a fenced code block in the middle of its prose. */
const FENCED = [`text of a kind`, `\`\`\`js`, `let a = the value`, `\`\`\``, `of a kind`].join(`\n`)

describe(`bindProse`, () => {
	it(`binds every line of prose`, () => {
		expect(bindProse(`the word\nof course`)).toBe(`the${NBSP}word\nof${NBSP}course`)
	})

	it(`leaves a fenced code block alone`, () => {
		let bound = [`text of${NBSP}a${NBSP}kind`, `\`\`\`js`, `let a = the value`, `\`\`\``, `of${NBSP}a${NBSP}kind`].join(`\n`)

		expect(bindProse(FENCED)).toBe(bound)
	})

	it(`binds a bound document to itself`, () => {
		let once = bindProse(`the word of a kind — and more`)

		expect(bindProse(once)).toBe(once)
	})

	it(`undoes a non-breaking space no rule would put there`, () => {
		expect(bindProse(`plain${NBSP}words`)).toBe(`plain words`)
	})

	it(`keeps the line count`, () => {
		expect(bindProse(`\n\na\n\n`)).toBe(`\n\na\n\n`)
	})
})
