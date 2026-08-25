import { defineConfig } from "vitest/config"

export default defineConfig({
	test: {
		include: [`src/**/*.test.ts`],
		isolate: false,
		watch: false,
		coverage: {
			provider: `v8`,
			reporter: [`text`, `json`, `html`],
			include: [`src/**/*.ts`],
			exclude: [`src/**/*.test.ts`, `src/**/types.ts`, `src/bin/cli.ts`],
			thresholds: { statements: 100, branches: 100, functions: 100, lines: 100 },
		},
	},
})
