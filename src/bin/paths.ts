import type { Dirent } from "node:fs"
import { readdirSync } from "node:fs"

import type { Write } from "./types.ts"

/** Every name of a directory whose contents belong to a tool rather than to the prose. A name rather than a path, so that it is refused wherever in the tree it stands. */
const SKIPPED_DIRECTORY_NAMES = new Set([`.claude`, `.git`, `coverage`, `dist`, `node_modules`, `tmp`])

/** The license text is quoted verbatim, so it is left exactly as its source has it. A path from the root of the walk: a `docs/LICENSE.md` is prose like any other. */
const SKIPPED_FILES = new Set([`LICENSE.md`])

/**
 * Collects the prose of one directory and of everything under it, declining to descend into a skipped name.
 *
 * `readdirSync` takes no list of subtrees to leave unread, so a walk asking it for the whole tree at once reads `node_modules` and `tmp` in full before any filter over its result can drop them — and a single entry under either that cannot be read ends the run over a directory the repository does not carry. Reading one directory at a time is what lets the name be refused before it costs anything.
 *
 * A directory that cannot be read is said aloud and stepped over rather than ending the walk: the prose of the rest of the tree is no less bound for one directory being closed, and a walk that stops on the first refusal leaves the caller with nothing.
 *
 * @param {string} root - The directory the walk started from.
 * @param {string} relative - The directory to read, relative to that one, and empty for that one itself.
 * @param {string[]} paths - Where the prose found so far is collected.
 * @param {Write} writeError - What a directory that cannot be read is reported through.
 */
function collectProseFrom (root: string, relative: string, paths: string[], writeError: Write): void {
	let directory = relative ? `${root}/${relative}` : root
	let entries: Dirent[]

	try {
		entries = readdirSync(directory, { withFileTypes: true })
	}
	catch (error) {
		writeError(`\tCannot read ${directory}, so its prose is left as it is: ${(error as Error).message}\n`)

		return
	}

	for (let entry of entries) {
		let path = relative ? `${relative}/${entry.name}` : entry.name

		if (entry.isDirectory()) {
			if (!SKIPPED_DIRECTORY_NAMES.has(entry.name)) collectProseFrom(root, path, paths, writeError)
		}
		else if (path.endsWith(`.md`) && !SKIPPED_FILES.has(path)) paths.push(path)
	}
}

/**
 * Collects every Markdown file the convention applies to.
 *
 * @param {string} directory - The directory to walk.
 * @param {Write} writeError - What a directory that cannot be read is reported through.
 * @returns {string[]} The paths, relative to that directory, in a stable order.
 */
export function collectProsePaths (directory: string, writeError: Write): string[] {
	let paths: string[] = []

	collectProseFrom(directory, ``, paths, writeError)

	return paths.toSorted()
}
