import { i18n } from '@lingui/core';
import { describe, expect, it } from 'vitest';

import { describeDictationError } from './describe_dictation_error';
import { DictationClientError } from '~/dictation/core/dictation_client_error';
import { MicrophoneError } from '~/dictation/core/microphone_error';
import { activateLocale } from '~/i18n/activate_locale';

describe('describeDictationError', () => {
	it('should word a refused microphone permission', () => {
		const message = describeDictationError(
			new MicrophoneError('permission_denied'),
			i18n
		);

		expect(message).toContain('Microphone access was denied');
	});

	it('should explain a blocked audio context', () => {
		const message = describeDictationError(
			new MicrophoneError('audio_blocked'),
			i18n
		);

		expect(message).toContain('blocks audio');
	});

	it('should word a lost connection', () => {
		const message = describeDictationError(
			new DictationClientError('connection_lost'),
			i18n
		);

		expect(message).toContain('connection was interrupted');
	});

	it('should word a server error code', () => {
		const error = new DictationClientError(
			'provider_error',
			'E_DICTATION_QUOTA_EXCEEDED'
		);

		expect(describeDictationError(error, i18n)).toContain(
			'daily dictation quota'
		);
	});

	it('should fall back to a generic message for an unknown server code', () => {
		const error = new DictationClientError('rejected', 'E_SOMETHING_NEW');

		expect(describeDictationError(error, i18n)).toBe(
			'Something went wrong during the dictation'
		);
	});

	it('should fall back to a generic message for anything unknown', () => {
		expect(describeDictationError(new Error('boom'), i18n)).toBe(
			'Something went wrong during the dictation'
		);
	});

	it('should word the error in French when the French locale is active', async () => {
		await activateLocale('fr');
		const error = new DictationClientError(
			'provider_error',
			'E_DICTATION_QUOTA_EXCEEDED'
		);

		expect(describeDictationError(error, i18n)).toBe(
			'Le quota quotidien de dictée est atteint, réessaie demain'
		);
	});
});
