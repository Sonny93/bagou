import { useLingui } from '@lingui/react/macro';
import { useEffect } from 'react';
import { toast } from 'sonner';

const UNHANDLED_ERROR_TOAST_ID = 'unhandled-error';

/**
 * Tells the user about an error nobody caught (a rejected promise, a throw
 * outside React). The browser already prints those in the console.
 */
export function useUnhandledErrorToasts(): void {
	const { t } = useLingui();

	useEffect(() => {
		const handleUnhandledError = () => {
			toast.error(t`Something went wrong`, { id: UNHANDLED_ERROR_TOAST_ID });
		};
		window.addEventListener('unhandledrejection', handleUnhandledError);
		window.addEventListener('error', handleUnhandledError);
		return () => {
			window.removeEventListener('unhandledrejection', handleUnhandledError);
			window.removeEventListener('error', handleUnhandledError);
		};
	}, [t]);
}
