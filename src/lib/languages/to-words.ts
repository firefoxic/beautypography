/**
 * Splits a written-out list into single words.
 *
 * A group is written as prose — several words to a line — so that it stays readable as it grows.
 *
 * @param {string} list - The words, separated by any whitespace.
 * @returns {string[]} The words, in the order they were written.
 */
export function toWords (list: string): string[] {
	return list.trim().split(/\s+/u)
}
