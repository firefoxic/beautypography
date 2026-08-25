import { readdirSync } from "node:fs"

/** Every name of a directory whose contents belong to a tool rather than to the prose. A name rather than a path, so that it is refused wherever in the tree it stands. */
const SKIPPED_DIRECTORY_NAMES = new Set([`.claude`, `.git`, `coverage`, `dist`, `node_modules`, `tmp`])

/** The license text is quoted verbatim, so it is left exactly as its source has it. A path from the root of the walk: a `docs/LICENSE.md` is prose like any other. */
const SKIPPED_FILES = new Set([`LICENSE.md`])

/**
 * Collects the prose of one directory and of everything under it, declining to descend into a skipped name.
 *
 * `readdirSync` takes no list of subtrees to leave unread, so a walk asking it for the whole tree at once reads `node_modules` and `tmp` in full before any filter over its result can drop them — and a single entry under either that cannot be read ends the run over a directory the repository does not carry. Reading one directory at a time is what lets the name be refused before it costs anything.
 *
 * @param {string} root - The directory the walk started from.
 * @param {string} relative - The directory to read, relative to that one, and empty for that one itself.
 * @param {string[]} paths - Where the prose found so far is collected.
 */
function collectProseFrom (root: string, relative: string, paths: string[]): void {
	for (let entry of readdirSync(relative ? `${root}/${relative}` : root, { withFileTypes: true })) {
		let path = relative ? `${relative}/${entry.name}` : entry.name

		if (entry.isDirectory()) {
			if (!SKIPPED_DIRECTORY_NAMES.has(entry.name)) collectProseFrom(root, path, paths)
		}
		else if (path.endsWith(`.md`) && !SKIPPED_FILES.has(path)) paths.push(path)
	}
}

/**
 * Collects every Markdown file the convention applies to.
 *
 * @param {string} directory - The directory to walk.
 * @returns {string[]} The paths, relative to that directory, in a stable order.
 */
export function collectProsePaths (directory: string = `.`): string[] {
	let paths: string[] = []

	collectProseFrom(directory, ``, paths)

	return paths.toSorted()
}
