#!/usr/bin/env node

import process, { argv, stderr, stdout } from "node:process"

import { main } from "./main.ts"

process.exitCode = main(argv.slice(2), (message) => {
	stdout.write(message)
}, (message) => {
	stderr.write(message)
})
