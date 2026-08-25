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

	it(`leaves a block fenced by tildes alone`, () => {
		let source = [`~~~`, `the value`, `~~~`].join(`\n`)

		expect(bindProse(source)).toBe(source)
	})

	it(`leaves a block fenced under an indent alone`, () => {
		let source = [`- item`, `  \`\`\``, `  the value`, `  \`\`\``].join(`\n`)

		expect(bindProse(source)).toBe(source)
	})

	it(`closes a block by a fence no shorter than the one that opened it`, () => {
		let source = [`\`\`\`\``, `the value`, `\`\`\``, `the value`, `\`\`\`\``].join(`\n`)

		expect(bindProse(source)).toBe(source)
	})

	it(`closes a block by a fence of its own character`, () => {
		let source = [`\`\`\``, `~~~`, `the value`, `\`\`\``].join(`\n`)

		expect(bindProse(source)).toBe(source)
	})

	it(`closes a block by a fence carrying nothing after it`, () => {
		let source = [`\`\`\``, `the value`, `\`\`\` js`, `the value`].join(`\n`)

		expect(bindProse(source)).toBe(source)
	})

	it(`carries an unclosed block to the end of the document`, () => {
		let source = [`\`\`\``, `the value`, `the value`].join(`\n`)

		expect(bindProse(source)).toBe(source)
	})

	it(`opens nothing on a line of backticks that holds another`, () => {
		expect(bindProse(`\`\`\`a\`\`\` of a kind`)).toBe(`\`\`\`a\`\`\` of${NBSP}a${NBSP}kind`)
	})

	it(`binds the prose that follows a block`, () => {
		let source = [`\`\`\`js of a kind`, `let a = the value`, `\`\`\``, `of a kind`].join(`\n`)
		let bound = [`\`\`\`js of a kind`, `let a = the value`, `\`\`\``, `of${NBSP}a${NBSP}kind`].join(`\n`)

		expect(bindProse(source)).toBe(bound)
	})

	it(`binds a bound document to itself`, () => {
		let once = bindProse(`the word of a kind — and more`)

		expect(bindProse(once)).toBe(once)
	})

	it(`undoes a non-breaking space no rule would put there`, () => {
		expect(bindProse(`plain${NBSP}words`)).toBe(`plain words`)
	})

	it(`leaves the spaces of an inline code span to its author`, () => {
		expect(bindProse(`text \`a${NBSP}b\` end`)).toBe(`text \`a${NBSP}b\` end`)
	})

	it(`leaves the spaces of a fenced code block to its author`, () => {
		let source = [`\`\`\``, `let a =${NBSP}b`, `\`\`\``].join(`\n`)

		expect(bindProse(source)).toBe(source)
	})

	it(`keeps the line count`, () => {
		expect(bindProse(`\n\na\n\n`)).toBe(`\n\na\n\n`)
	})
})
