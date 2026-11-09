export class MissingTranscriptionApiKeyError extends Error {
	override readonly name = 'MissingTranscriptionApiKeyError';
	readonly code = 'E_TRANSCRIPTION_API_KEY_MISSING';

	constructor(providerName: string, envName: string) {
		super(
			`The "${providerName}" transcription provider needs an API key: set ${envName}`
		);
	}
}
