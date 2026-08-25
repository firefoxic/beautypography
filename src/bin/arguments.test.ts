import { describe, expect, it } from "vitest"

import { parseArguments } from "./arguments.ts"

describe(`parseArguments`, () => {
	it(`reads nothing out of an empty command line`, () => {
		expect(parseArguments([])).toEqual({ isCheck: false, isHelp: false, isVersion: false, paths: [], unknown: [] })
	})

	it(`takes every word that is not an option for a path`, () => {
		expect(parseArguments([`README.md`, `docs/guide.md`]).paths).toEqual([`README.md`, `docs/guide.md`])
	})

	it(`reads the check option in either form`, () => {
		expect(parseArguments([`--check`]).isCheck).toBe(true)
		expect(parseArguments([`-c`]).isCheck).toBe(true)
	})

	it(`reads the help option in either form`, () => {
		expect(parseArguments([`--help`]).isHelp).toBe(true)
		expect(parseArguments([`-h`]).isHelp).toBe(true)
	})

	it(`reads the version option in either form`, () => {
		expect(parseArguments([`--version`]).isVersion).toBe(true)
		expect(parseArguments([`-v`]).isVersion).toBe(true)
	})

	it(`collects an option it does not know rather than guessing at it`, () => {
		expect(parseArguments([`--write`, `a.md`]).unknown).toEqual([`--write`])
		expect(parseArguments([`--write`, `a.md`]).paths).toEqual([`a.md`])
	})

	it(`keeps an option and a path apart wherever they stand`, () => {
		let parsed = parseArguments([`a.md`, `--check`, `b.md`])

		expect(parsed.isCheck).toBe(true)
		expect(parsed.paths).toEqual([`a.md`, `b.md`])
	})
})
