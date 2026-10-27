import { router } from '@inertiajs/react';
import { useLingui } from '@lingui/react/macro';
import { useEffect } from 'react';
import { toast } from 'sonner';

const NETWORK_ERROR_TOAST_ID = 'network-error';
const SERVER_ERROR_TOAST_ID = 'server-error';

/**
 * Tells the user when an Inertia request never reached the server or got an
 * HTTP error answer. In production the default error modal is replaced by the
 * toast.
 */
export function useRequestFailureToasts(): void {
	const { t } = useLingui();

	useEffect(
		() =>
			router.on('networkError', () => {
				toast.error(t`The server is unreachable, the action was not saved`, {
					id: NETWORK_ERROR_TOAST_ID,
				});
			}),
		[t]
	);

	useEffect(
		() =>
			router.on('httpException', (event) => {
				const status = event.detail.response.status;
				toast.error(t`Server error (HTTP ${status}), try again`, {
					id: SERVER_ERROR_TOAST_ID,
				});
				if (import.meta.env.PROD) event.preventDefault();
			}),
		[t]
	);
}
