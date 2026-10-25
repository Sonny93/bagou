import { DictationClientError } from '~/dictation/core/dictation_client_error';
import {
	MicrophoneError,
	type MicrophoneErrorCode,
} from '~/dictation/core/microphone_error';

const GENERIC_MESSAGE = "Une erreur s'est produite pendant la dictée";
const CONNECTION_FAILED_MESSAGE = 'Le serveur est injoignable';
const CONNECTION_LOST_MESSAGE =
	'La connexion a été interrompue, la dictée est perdue';

const MICROPHONE_MESSAGES: Record<MicrophoneErrorCode, string> = {
	permission_denied:
		"L'accès au microphone a été refusé, autorise-le dans le navigateur",
	no_device: 'Aucun microphone détecté',
	unsupported: "Ce navigateur ne permet pas d'enregistrer le micro",
	audio_blocked:
		"Le navigateur bloque l'audio, clique dans la page puis relance la dictée",
	failed: "Impossible d'utiliser le microphone",
};

const describeClientError = (error: DictationClientError): string => {
	if (error.code === 'connection_failed') return CONNECTION_FAILED_MESSAGE;
	if (error.code === 'connection_lost') return CONNECTION_LOST_MESSAGE;
	return error.message === error.code ? GENERIC_MESSAGE : error.message;
};

/** French wording for whatever can go wrong during a dictation. */
export function describeDictationError(error: unknown): string {
	if (error instanceof MicrophoneError) return MICROPHONE_MESSAGES[error.code];
	if (error instanceof DictationClientError) return describeClientError(error);
	return GENERIC_MESSAGE;
}
