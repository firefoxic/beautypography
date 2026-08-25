import { readFileSync, writeFileSync } from "node:fs"

import { bindProse } from "../lib/bind-prose.ts"

import { parseArguments } from "./arguments.ts"
import { collectProsePaths } from "./paths.ts"

/** What the command answers `--help` with, and what it falls back to when an option is not understood. */
const USAGE = `
	Usage: beautypography [options] [file...]

	Binds function words, numbers and em dashes in Markdown prose with non-breaking spaces.

	With no file given, every Markdown file below the current directory is bound.

	Options:
		-c, --check  Report the files that need binding, and exit with 1 if any do
		-h, --help   Print this message
`

/**
 * Runs the command.
 *
 * Writing is passed in rather than reached for, so that the command answers for what it prints.
 *
 * @param {string[]} argv - The arguments, without the executable and the script.
 * @param {(message: string) => void} write - What the command reports through.
 * @returns {number} The exit code.
 */
export function main (argv: string[], write: (message: string) => void): number {
	let { isCheck, isHelp, paths, unknown } = parseArguments(argv)

	if (unknown.length > 0) {
		write(`\tUnknown ${unknown.length > 1 ? `options` : `option`}: ${unknown.join(`, `)}\n${USAGE}`)

		return 1
	}

	if (isHelp) {
		write(USAGE)

		return 0
	}

	let targets = paths.length > 0 ? paths : collectProsePaths()
	let unbound: string[] = []

	for (let path of targets) {
		let source = readFileSync(path, `utf8`)
		let bound = bindProse(source)

		if (source === bound) continue

		if (isCheck) {
			unbound.push(path)
			continue
		}

		writeFileSync(path, bound)
		write(`\tbound ${path}\n`)
	}

	if (unbound.length === 0) return 0

	write(`\tUnbound prose in:\n\t\t${unbound.join(`\n\t\t`)}\n\tRun beautypography and review the result.\n`)

	return 1
}
