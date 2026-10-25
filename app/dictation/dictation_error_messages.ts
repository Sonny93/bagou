import { DictationErrorCode } from '#dictation/dictation_error_code';

/**
 * Safe, user-facing wording per error code: provider messages never reach the
 * browser.
 */
export const DICTATION_ERROR_MESSAGES = {
	[DictationErrorCode.connectionFailed]:
		'Impossible de joindre le service de transcription.',
	[DictationErrorCode.connectionClosed]:
		'La connexion au service de transcription a été interrompue.',
	[DictationErrorCode.providerRejected]:
		'Le service de transcription a refusé la dictée.',
	[DictationErrorCode.finishTimeout]:
		"Le service de transcription n'a pas répondu à temps.",
	[DictationErrorCode.sessionNotActive]:
		"La session de transcription n'est plus active.",
	[DictationErrorCode.sessionAborted]:
		'La session de transcription a été interrompue.',
	[DictationErrorCode.tooLong]: 'La dictée a atteint la durée maximale.',
} as const satisfies Record<DictationErrorCode, string>;
