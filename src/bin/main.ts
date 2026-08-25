import { readFileSync, writeFileSync } from "node:fs"
import { createRequire } from "node:module"

import { bindProse } from "../lib/bind-prose.ts"

import { parseArguments } from "./arguments.ts"
import { collectProsePaths } from "./paths.ts"
import type { Write } from "./types.ts"

/** What the command answers `--help` with, and what it falls back to when an option is not understood. */
const USAGE = `
	Usage: beautypography [options] [file...]

	Binds function words, numbers and em dashes in Markdown prose with non-breaking spaces.

	With no file given, every Markdown file below the current directory is bound. A file given by name is bound whatever it is called: naming one is asking for it.

	Options:
		-c, --check    Report the files that need binding, and exit with 1 if any do
		-h, --help     Print this message
		-v, --version  Print the version
`

/**
 * Reads the version out of the manifest of the package.
 *
 * The manifest sits two directories above this file whether it runs from `src/bin` or from `dist/bin`, so the one path answers for both.
 *
 * @returns {string} The version.
 */
function readVersion (): string {
	let load = createRequire(import.meta.url)
	let manifest = load(`../../package.json`) as { version: string }

	return manifest.version
}

/**
 * Binds every path it is given, or names the ones that would change.
 *
 * @param {string[]} targets - The paths to bind.
 * @param {boolean} isCheck - Whether to report rather than write.
 * @param {Write} write - What the command reports through.
 * @param {Write} writeError - What the command reports a failure through.
 * @returns {number} The exit code.
 */
function bindPaths (targets: string[], isCheck: boolean, write: Write, writeError: Write): number {
	let unbound: string[] = []

	for (let path of targets) {
		let source: string

		try {
			source = readFileSync(path, `utf8`)
		}
		catch (error) {
			writeError(`\tCannot read ${path}: ${(error as Error).message}\n`)

			return 2
		}

		let bound = bindProse(source)

		if (source === bound) continue

		if (isCheck) {
			unbound.push(path)
			continue
		}

		try {
			writeFileSync(path, bound)
		}
		catch (error) {
			writeError(`\tCannot write ${path}: ${(error as Error).message}\n`)

			return 2
		}

		write(`\tbound ${path}\n`)
	}

	if (unbound.length === 0) return 0

	writeError(`\tUnbound prose in:\n\t\t${unbound.join(`\n\t\t`)}\n\tRun beautypography and review the result.\n`)

	return 1
}

/**
 * Runs the command.
 *
 * Writing is passed in rather than reached for, so that the command answers for what it prints — and there are two of them, because what went wrong belongs on the error stream rather than among the results.
 *
 * @param {string[]} argv - The arguments, without the executable and the script.
 * @param {Write} write - What the command reports through.
 * @param {Write} writeError - What the command reports a failure through.
 * @returns {number} The exit code.
 */
export function main (argv: string[], write: Write, writeError: Write): number {
	let { isCheck, isHelp, isVersion, paths, unknown } = parseArguments(argv)

	if (unknown.length > 0) {
		writeError(`\tUnknown ${unknown.length > 1 ? `options` : `option`}: ${unknown.join(`, `)}\n${USAGE}`)

		return 1
	}

	if (isHelp) {
		write(USAGE)

		return 0
	}

	if (isVersion) {
		write(`${readVersion()}\n`)

		return 0
	}

	return bindPaths(paths.length > 0 ? paths : collectProsePaths(`.`, writeError), isCheck, write, writeError)
}
