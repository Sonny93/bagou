const userSettingsConfig = {
	/** Mistral documents 100 `context_bias` terms as the cap. */
	maxVocabularyTerms: 100,
	maxTermLength: 100,
	maxInstructionsLength: 2000,
	defaults: {
		dictationLanguage: 'en',
		interfaceLanguage: 'system',
		vocabulary: [],
		cleanupInstructions: '',
	},
} as const;

export default userSettingsConfig;
