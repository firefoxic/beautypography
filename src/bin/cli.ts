#!/usr/bin/env node

import { argv, exit, stdout } from "node:process"

import { main } from "./main.ts"

exit(main(argv.slice(2), (message) => {
	stdout.write(message)
}))
