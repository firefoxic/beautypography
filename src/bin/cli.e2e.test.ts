import { execFileSync, spawnSync } from "node:child_process"
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import path from "node:path"

import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest"

import { NBSP } from "../lib/constants.ts"

/** The executable the package ships, as the build leaves it. */
const CLI = `dist/bin/cli.js`

let directory = ``

/**
 * Runs the built executable.
 *
 * @param {string[]} argv - The arguments to run it with.
 * @returns {{ status: number | null, stdout: string, stderr: string }} What it answered.
 */
function run (argv: string[]): { status: number | null, stdout: string, stderr: string } {
	let { status, stdout, stderr } = spawnSync(process.execPath, [CLI, ...argv], { encoding: `utf8` })

	return { status, stdout, stderr }
}

beforeAll(() => {
	execFileSync(`node_modules/.bin/tsdown`, { stdio: `pipe` })
}, 60_000)

beforeEach(() => {
	mkdirSync(`tmp`, { recursive: true })
	directory = mkdtempSync(path.join(`tmp`, `cli-`))
})

afterEach(() => {
	rmSync(directory, { recursive: true, force: true })
})

describe(`the built executable`, () => {
	it(`prints its version`, () => {
		let { status, stdout } = run([`--version`])

		expect(status).toBe(0)
		expect(stdout).toMatch(/^\d+\.\d+\.\d+/u)
	})

	it(`prints the usage`, () => {
		let { status, stdout } = run([`--help`])

		expect(status).toBe(0)
		expect(stdout).toContain(`Usage: beautypography`)
	})

	it(`binds a file it is given`, () => {
		let file = path.join(directory, `a.md`)

		writeFileSync(file, `the word\n`)

		let { status, stdout } = run([file])

		expect(status).toBe(0)
		expect(stdout).toContain(`bound ${file}`)
		expect(readFileSync(file, `utf8`)).toBe(`the${NBSP}word\n`)
	})

	it(`reports unbound prose on the error stream and answers with 1`, () => {
		let file = path.join(directory, `a.md`)

		writeFileSync(file, `the word\n`)

		let { status, stdout, stderr } = run([file, `--check`])

		expect(status).toBe(1)
		expect(stderr).toContain(file)
		expect(stdout).toBe(``)
		expect(readFileSync(file, `utf8`)).toBe(`the word\n`)
	})

	it(`names a file it cannot read and answers with 2`, () => {
		let { status, stderr } = run([path.join(directory, `nowhere.md`)])

		expect(status).toBe(2)
		expect(stderr).toContain(`Cannot read`)
	})
})
