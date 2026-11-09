const userSettingsConfig = {
	/** Fits both providers: Mistral caps `context_bias` at 100 terms, Deepgram caps keyterms at 500 tokens. */
	maxVocabularyTerms: 100,
	maxTermLength: 100,
	maxInstructionsLength: 2000,
	maxCorrections: 500,
	maxCorrectionSideLength: 100,
	defaults: {
		dictationLanguage: 'en',
		interfaceLanguage: 'system',
		vocabulary: [],
		cleanupQuality: 'standard',
		cleanupInstructions: '',
	},
} as const;

export default userSettingsConfig;
