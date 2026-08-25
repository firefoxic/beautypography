import { describe, expect, it } from "vitest"

import { maskCodeSpans, unmaskCodeSpans } from "./code-spans.ts"

/** A line with two spans in it. */
const LINE = `a \`one\` and \`two\``

describe(`maskCodeSpans`, () => {
	it(`takes every span out and numbers it`, () => {
		let { masked, spans } = maskCodeSpans(LINE)

		expect(spans).toEqual([`\`one\``, `\`two\``])
		expect(masked).not.toContain(`\``)
	})

	it(`keeps a span of a wider backtick fence whole`, () => {
		let { spans } = maskCodeSpans(`text \`\`a \` b\`\` more`)

		expect(spans).toEqual([`\`\`a \` b\`\``])
	})

	it(`leaves a line without a span alone`, () => {
		let { masked, spans } = maskCodeSpans(`plain prose`)

		expect(masked).toBe(`plain prose`)
		expect(spans).toEqual([])
	})
})

describe(`unmaskCodeSpans`, () => {
	it(`restores what masking took out`, () => {
		let { masked, spans } = maskCodeSpans(LINE)

		expect(unmaskCodeSpans(masked, spans)).toBe(LINE)
	})
})
