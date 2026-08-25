import type { Language } from "../types.ts"

import { toWords } from "./to-words.ts"

/** The articles never stand apart from the noun phrase they open. */
const ARTICLES = `
	a an the
`

/** A preposition leans on the word it governs. */
const PREPOSITIONS = `
	about across after against as at before between by during for from in inside
	into like of on onto over per since than through to toward towards under
	unlike until upon via with within without
`

/** A coordinating conjunction joins what stands on either side of it. */
const COORDINATING_CONJUNCTIONS = `
	and but nor or so
`

/** A subordinating conjunction opens the clause that follows it. */
const SUBORDINATING_CONJUNCTIONS = `
	although because if that though unless when whereas while
`

/** A relative pronoun opens the clause it refers back with. */
const RELATIVE_PRONOUNS = `
	which
`

/** A particle carries no weight of its own and belongs to the word it qualifies. */
const PARTICLES = `
	not
`

/** A numeral spelled out counts the noun that follows it, exactly as a digit would. */
const NUMERALS = `
	two three four five six seven eight nine ten eleven twelve
`

/** `no` binds to nothing on its own, but never parts with `longer`. */
const PHRASES = [`no longer`]

/** Names of works stay whole, and no rule can tell them from ordinary prose. */
const PROPER_NAMES = [`Keep a Changelog`, `Semantic Versioning`]

/** Pairs the rules bind but the meaning does not: `that` as a pronoun in front of its verb, `on` as an adverb rather than a preposition. */
const EXCEPTIONS = [`that is`, `that says`, `on too`]

/** English, as the convention applies to it. */
export const ENGLISH: Language = {
	boundWords: toWords([
		ARTICLES,
		PREPOSITIONS,
		COORDINATING_CONJUNCTIONS,
		SUBORDINATING_CONJUNCTIONS,
		RELATIVE_PRONOUNS,
		PARTICLES,
		NUMERALS,
	].join(` `)),
	boundPhrases: PHRASES,
	properNames: PROPER_NAMES,
	exceptions: EXCEPTIONS,
}
