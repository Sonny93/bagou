import { test } from '@japa/runner';
import { DateTime } from 'luxon';

import { TranscriptFactory } from '#database/factories/transcript_factory';
import TranscriptTransformer from '#transcription_history/transcript_transformer';

test.group('TranscriptTransformer', () => {
	test('should expose the texts and the date but not the search vector', async ({
		assert,
	}) => {
		const transcript = await TranscriptFactory.merge({
			id: 4,
			rawText: 'euh bonjour',
			cleanedText: 'Bonjour.',
			createdAt: DateTime.fromISO('2026-01-01T00:00:00.000Z'),
			searchVector: "'bonjour':1",
		}).makeStubbed();

		const output = new TranscriptTransformer(transcript).toObject();

		assert.deepEqual(output, {
			id: 4,
			rawText: 'euh bonjour',
			cleanedText: 'Bonjour.',
			createdAt: '2026-01-01T00:00:00.000Z',
		});
	});
});
