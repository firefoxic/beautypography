import type { Arguments } from "./types.ts"

/**
 * Reads the command line.
 *
 * Everything that is not an option is a path, and an option that is not known is collected rather than guessed at.
 *
 * @param {string[]} argv - The arguments, without the executable and the script.
 * @returns {Arguments} What the command line asked for.
 */
export function parseArguments (argv: string[]): Arguments {
	let parsed: Arguments = { isCheck: false, isHelp: false, paths: [], unknown: [] }

	for (let argument of argv) {
		switch (argument) {
			case `--check`:
			case `-c`:
				parsed.isCheck = true
				break
			case `--help`:
			case `-h`:
				parsed.isHelp = true
				break
			default:
				if (argument.startsWith(`-`)) parsed.unknown.push(argument)
				else parsed.paths.push(argument)
		}
	}

	return parsed
}
