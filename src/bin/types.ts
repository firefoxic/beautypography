/** What the command reports through. */
export type Write = (message: string) => void

/** What the command line asked for. */
export type Arguments = {

	/** Report the files that need binding instead of writing them. */
	isCheck: boolean,

	/** Print the usage and do nothing else. */
	isHelp: boolean,

	/** Print the version and do nothing else. */
	isVersion: boolean,

	/** The files to bind; empty means every Markdown file below the current directory. */
	paths: string[],

	/** The options that were not understood. */
	unknown: string[],
}
