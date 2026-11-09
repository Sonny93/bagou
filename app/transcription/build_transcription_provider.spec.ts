import { test } from '@japa/runner';

import { buildTranscriptionProvider } from '#transcription/build_transcription_provider';
import { MissingTranscriptionApiKeyError } from '#transcription/missing_transcription_api_key_error';

const NO_OP_LOGGER = { warn: () => undefined };

function buildWithKeys(
	providerName: 'mistral' | 'deepgram',
	keys: Record<string, string | undefined>
) {
	return buildTranscriptionProvider({
		providerName,
		getApiKey: (envName) => keys[envName],
		logger: NO_OP_LOGGER,
	});
}

test.group('buildTranscriptionProvider', () => {
	test('should build the Mistral adapter from MISTRAL_API_KEY', ({
		assert,
	}) => {
		const provider = buildWithKeys('mistral', { MISTRAL_API_KEY: 'key' });

		assert.equal(provider.name, 'mistral');
	});

	test('should build the Deepgram adapter from DEEPGRAM_API_KEY', ({
		assert,
	}) => {
		const provider = buildWithKeys('deepgram', { DEEPGRAM_API_KEY: 'key' });

		assert.equal(provider.name, 'deepgram');
	});

	test('should throw naming the env var when the key of the chosen provider is missing', ({
		assert,
	}) => {
		assert.throws(
			() => buildWithKeys('deepgram', { MISTRAL_API_KEY: 'key' }),
			/DEEPGRAM_API_KEY/
		);
	});

	test('should throw a typed error when the key is empty', ({ assert }) => {
		assert.throws(
			() => buildWithKeys('mistral', { MISTRAL_API_KEY: '' }),
			MissingTranscriptionApiKeyError
		);
	});
});
