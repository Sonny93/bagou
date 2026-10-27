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

	it('should word a start that timed out', () => {
		const message = describeDictationError(
			new DictationClientError('start_timed_out'),
			i18n
		);

		expect(message).toBe('The dictation service is not responding, try again');
	});

	it('should word a completion that timed out', () => {
		const message = describeDictationError(
			new DictationClientError('completion_timed_out'),
			i18n
		);

		expect(message).toBe(
			'The cleanup is taking too long, your dictation will be in the history'
		);
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

	it('should word the timeouts in French when the French locale is active', async () => {
		await activateLocale('fr');

		expect(
			describeDictationError(new DictationClientError('start_timed_out'), i18n)
		).toBe('Le service de dictée ne répond pas, réessaie');
		expect(
			describeDictationError(
				new DictationClientError('completion_timed_out'),
				i18n
			)
		).toBe(
			"Le nettoyage prend trop de temps, ta dictée sera dans l'historique"
		);
	});
});
