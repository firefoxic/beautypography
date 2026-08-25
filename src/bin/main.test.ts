import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import path from "node:path"

import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { NBSP } from "../lib/constants.ts"

import { main } from "./main.ts"

let directory = ``
let output: string[] = []
let errors: string[] = []

/**
 * Collects what the command writes.
 *
 * @param {string} message - What the command reported.
 */
function write (message: string): void {
	output.push(message)
}

/**
 * Collects what the command writes about a failure.
 *
 * @param {string} message - What the command reported.
 */
function writeError (message: string): void {
	errors.push(message)
}

/**
 * Writes a fixture file and answers with its path.
 *
 * @param {string} name - The file name.
 * @param {string} content - What to write into it.
 * @returns {string} The path the command is given.
 */
function fixture (name: string, content: string): string {
	let file = path.join(directory, name)

	writeFileSync(file, content)

	return file
}

beforeEach(() => {
	mkdirSync(`tmp`, { recursive: true })
	directory = mkdtempSync(path.join(`tmp`, `main-`))
	output = []
	errors = []
})

afterEach(() => {
	rmSync(directory, { recursive: true, force: true })
})

describe(`main`, () => {
	it(`binds the files it is given and says which it bound`, () => {
		let file = fixture(`a.md`, `the word\n`)

		expect(main([file], write, writeError)).toBe(0)
		expect(readFileSync(file, `utf8`)).toBe(`the${NBSP}word\n`)
		expect(output.join(``)).toContain(`bound ${file}`)
	})

	it(`says nothing about a file that is already bound`, () => {
		let file = fixture(`a.md`, `plain words\n`)

		expect(main([file], write, writeError)).toBe(0)
		expect(output).toEqual([])
	})

	it(`writes nothing while checking, and answers with 1`, () => {
		let file = fixture(`a.md`, `the word\n`)

		expect(main([file, `--check`], write, writeError)).toBe(1)
		expect(readFileSync(file, `utf8`)).toBe(`the word\n`)
		expect(errors.join(``)).toContain(file)
		expect(output).toEqual([])
	})

	it(`answers with 0 while checking a bound file`, () => {
		let file = fixture(`a.md`, `plain words\n`)

		expect(main([file, `--check`], write, writeError)).toBe(0)
		expect(output).toEqual([])
	})

	it(`prints the usage when it is asked for`, () => {
		expect(main([`--help`], write, writeError)).toBe(0)
		expect(output.join(``)).toContain(`Usage: beautypography`)
	})

	it(`names an option it does not know on the error stream, and answers with 1`, () => {
		expect(main([`--write`], write, writeError)).toBe(1)
		expect(errors.join(``)).toContain(`Unknown option: --write`)
		expect(errors.join(``)).toContain(`Usage: beautypography`)
		expect(output).toEqual([])
	})

	it(`names every option it does not know`, () => {
		expect(main([`--write`, `-x`], write, writeError)).toBe(1)
		expect(errors.join(``)).toContain(`Unknown options: --write, -x`)
	})

	it(`prints the version when it is asked for`, () => {
		expect(main([`--version`], write, writeError)).toBe(0)
		expect(output.join(``)).toMatch(/^\d+\.\d+\.\d+/u)
	})

	it(`names a file it cannot read rather than ending on a stack trace`, () => {
		let missing = path.join(directory, `nowhere.md`)

		expect(main([missing], write, writeError)).toBe(2)
		expect(errors.join(``)).toContain(`Cannot read ${missing}`)
	})

	it(`binds a file it is given whatever it is called`, () => {
		let file = fixture(`LICENSE.md`, `the word\n`)

		expect(main([file], write, writeError)).toBe(0)
		expect(readFileSync(file, `utf8`)).toBe(`the${NBSP}word\n`)
	})
})
