import { chmodSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import path from "node:path"
import { getuid } from "node:process"

import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { collectProsePaths } from "./paths.ts"

let directory = ``
let errors: string[] = []

/**
 * Collects what the walk reports about a directory it cannot read.
 *
 * @param {string} message - What the walk reported.
 */
function writeError (message: string): void {
	errors.push(message)
}

/**
 * Writes a file, and every directory on the way to it.
 *
 * @param {string} relative - The path, relative to the directory the walk starts from.
 */
function file (relative: string): void {
	let full = path.join(directory, relative)

	mkdirSync(path.dirname(full), { recursive: true })
	writeFileSync(full, `the word\n`)
}

/**
 * Makes a directory, and every directory on the way to it.
 *
 * @param {string} relative - The path, relative to the directory the walk starts from.
 * @returns {string} The path it was made at.
 */
function folder (relative: string): string {
	let full = path.join(directory, relative)

	mkdirSync(full, { recursive: true })

	return full
}

beforeEach(() => {
	mkdirSync(`tmp`, { recursive: true })
	directory = mkdtempSync(path.join(`tmp`, `paths-`))
	errors = []
})

afterEach(() => {
	rmSync(directory, { recursive: true, force: true })
})

describe(`collectProsePaths`, () => {
	it(`finds the Markdown of a directory and of everything under it`, () => {
		file(`README.md`)
		file(`docs/guide.md`)
		file(`docs/deep/further/note.md`)
		file(`src/index.ts`)

		expect(collectProsePaths(directory, writeError)).toEqual([`README.md`, `docs/deep/further/note.md`, `docs/guide.md`])
	})

	it(`refuses a skipped name wherever in the tree it stands`, () => {
		file(`node_modules/pkg/README.md`)
		file(`packages/one/node_modules/pkg/README.md`)
		file(`packages/one/dist/built.md`)
		file(`tmp/notes.md`)
		file(`.claude/specs/plan.md`)
		file(`kept.md`)

		expect(collectProsePaths(directory, writeError)).toEqual([`kept.md`])
	})

	it(`leaves the license of the root exactly as its source has it, and binds any other`, () => {
		file(`LICENSE.md`)
		file(`docs/LICENSE.md`)

		expect(collectProsePaths(directory, writeError)).toEqual([`docs/LICENSE.md`])
	})

	it(`descends into a directory named like prose rather than reading it as a file`, () => {
		file(`weird.md/inside.md`)

		expect(collectProsePaths(directory, writeError)).toEqual([`weird.md/inside.md`])
	})

	it(`returns the paths in a stable order`, () => {
		file(`b.md`)
		file(`a.md`)
		file(`c/a.md`)

		expect(collectProsePaths(directory, writeError)).toEqual([`a.md`, `b.md`, `c/a.md`])
	})

	it(`leaves a skipped tree unread rather than dropping it out of the result`, () => {
		file(`kept.md`)
		symlinkSync(`..`, path.join(folder(`node_modules/pkg`), `loop`), `dir`)

		expect(collectProsePaths(directory, writeError)).toEqual([`kept.md`])
	})

	it.skipIf(getuid?.() === 0)(`says which directory it could not read, and walks on`, () => {
		file(`kept.md`)
		file(`docs/deep.md`)

		let blocked = folder(`docs/closed`)

		chmodSync(blocked, 0o000)

		try {
			expect(collectProsePaths(directory, writeError)).toEqual([`docs/deep.md`, `kept.md`])
			expect(errors.join(``)).toContain(`Cannot read ${directory}/docs/closed`)
			expect(errors.join(``)).toContain(`permission denied`)
		}
		finally {
			chmodSync(blocked, 0o755)
		}
	})

	it.skipIf(getuid?.() === 0)(`does not end the walk over a directory it never meant to open`, () => {
		file(`kept.md`)

		let blocked = folder(`node_modules/blocked`)

		chmodSync(blocked, 0o000)

		try {
			expect(collectProsePaths(directory, writeError)).toEqual([`kept.md`])
		}
		finally {
			chmodSync(blocked, 0o755)
		}
	})
})
