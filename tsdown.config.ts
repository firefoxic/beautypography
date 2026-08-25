import { defineConfig } from "tsdown"

export default defineConfig({
	entry: {
		"bin/cli": `src/bin/cli.ts`,
		"lib/index": `src/lib/index.ts`,
	},
	fixedExtension: false,
	minify: true,
	// Declarations are on for the whole build, since the `exports` map of the package names a `types` entry — and the shebang has no type to declare, so the empty file written for it is swept away rather than shipped.
	onSuccess: `rm -f dist/bin/cli.d.ts`,
})
