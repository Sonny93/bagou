import { describe, expect, it } from 'vitest';

import { describeDictationError } from './describe_dictation_error';
import { DictationClientError } from '~/dictation/core/dictation_client_error';
import { MicrophoneError } from '~/dictation/core/microphone_error';

describe('describeDictationError', () => {
	it('should word a refused microphone permission in French', () => {
		const message = describeDictationError(
			new MicrophoneError('permission_denied')
		);

		expect(message).toContain('microphone a été refusé');
	});

	it('should explain a blocked audio context', () => {
		const message = describeDictationError(
			new MicrophoneError('audio_blocked')
		);

		expect(message).toContain('bloque');
	});

	it('should word a lost connection in French', () => {
		const message = describeDictationError(
			new DictationClientError('connection_lost')
		);

		expect(message).toContain('connexion a été interrompue');
	});

	it('should show the safe message sent by the server', () => {
		const error = new DictationClientError(
			'provider_error',
			'Le service est indisponible'
		);

		expect(describeDictationError(error)).toBe('Le service est indisponible');
	});

	it('should fall back to a generic message for anything unknown', () => {
		expect(describeDictationError(new Error('boom'))).toContain('erreur');
	});
});
