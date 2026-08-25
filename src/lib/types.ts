/** Everything the binder needs to know about one language. */
export type Language = {

	/** Words that bind forward to the word that follows them. */
	boundWords: string[],

	/** Sequences of words that stay whole wherever they occur, whatever their case. */
	boundPhrases: string[],

	/** Names that stay whole, matched exactly as they are written. */
	properNames: string[],

	/** Sequences the rules bind but the meaning does not; they are unbound again once every other rule has run. */
	exceptions: string[],
}

/** A language compiled into the expressions a line of prose is matched against. */
export type Patterns = {

	/** A single bound word, keeping any emphasis markers glued to it (`**not**`). */
	boundWord: RegExp,

	/** A number together with the word it may lean back on and the space it may bind forward across. */
	number: RegExp,

	/** One expression per phrase that stays whole. */
	boundPhrases: RegExp[],

	/** The names that stay whole, longest first, so that a name never eats a shorter one. Matched as they are written, since the case of a name carries meaning. */
	properNames: RegExp[],

	/** One expression per sequence that is unbound again at the end. */
	exceptions: RegExp[],
}

/** A line with its inline code spans taken out of the way. */
export type MaskedLine = {

	/** The line, with every code span replaced by a placeholder. */
	masked: string,

	/** The spans that were taken out, in the order their placeholders number them. */
	spans: string[],
}
