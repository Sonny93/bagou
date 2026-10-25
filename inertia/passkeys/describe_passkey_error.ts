import { TuyauHTTPError, TuyauNetworkError } from '@tuyau/core/client';

const GENERIC_MESSAGE = "Une erreur s'est produite, réessaie";
const CANCELLED_MESSAGE = 'Opération annulée';
const ALREADY_REGISTERED_MESSAGE = 'Cette passkey est déjà enregistrée';
const NETWORK_MESSAGE = 'Le serveur est injoignable';

const readMessage = (value: unknown): string | null => {
	if (typeof value !== 'object' || value === null) return null;
	if (!('message' in value)) return null;
	return typeof value.message === 'string' ? value.message : null;
};

const readServerMessage = (body: unknown): string | null => {
	if (typeof body !== 'object' || body === null) return null;
	if ('errors' in body && Array.isArray(body.errors)) {
		return readMessage(body.errors[0]);
	}
	return readMessage(body);
};

/**
 * Turns anything thrown by a passkey ceremony (browser, server, network)
 * into a French message safe to show to the user.
 */
export function describePasskeyError(error: unknown): string {
	if (error instanceof TuyauHTTPError) {
		return readServerMessage(error.response) ?? GENERIC_MESSAGE;
	}
	if (error instanceof TuyauNetworkError) return NETWORK_MESSAGE;
	if (!(error instanceof Error)) return GENERIC_MESSAGE;
	if (error.name === 'NotAllowedError') return CANCELLED_MESSAGE;
	if (error.name === 'InvalidStateError') return ALREADY_REGISTERED_MESSAGE;
	return GENERIC_MESSAGE;
}
