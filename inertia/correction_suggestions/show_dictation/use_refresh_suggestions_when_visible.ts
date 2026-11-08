import { router } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

import { shouldRefreshSuggestions } from '~/correction_suggestions/show_dictation/should_refresh_suggestions';

type UseRefreshSuggestionsWhenVisibleOptions = {
	getIsDrawerOpen: () => boolean;
	getIsPushing: () => boolean;
};

/**
 * Reloads the suggestions props when the tab becomes visible again, so what
 * was handled on another device or in the settings goes away and what was
 * found there shows up. A reload keeps the page state (draft,
 * dictation) as it is.
 */
export function useRefreshSuggestionsWhenVisible({
	getIsDrawerOpen,
	getIsPushing,
}: Readonly<UseRefreshSuggestionsWhenVisibleOptions>): void {
	const lastRefreshAtRef = useRef(0);

	useEffect(() => {
		lastRefreshAtRef.current = Date.now();
		const handleVisibilityChange = () => {
			if (document.visibilityState !== 'visible') return;
			const now = Date.now();
			const isWorthIt = shouldRefreshSuggestions({
				now,
				lastRefreshAt: lastRefreshAtRef.current,
				isDrawerOpen: getIsDrawerOpen(),
				isPushing: getIsPushing(),
			});
			if (!isWorthIt) return;
			lastRefreshAtRef.current = now;
			router.reload({
				only: ['corrections', 'pendingSuggestions', 'dismissedSuggestions'],
			});
		};
		document.addEventListener('visibilitychange', handleVisibilityChange);
		return () =>
			document.removeEventListener('visibilitychange', handleVisibilityChange);
	}, [getIsDrawerOpen, getIsPushing]);
}
