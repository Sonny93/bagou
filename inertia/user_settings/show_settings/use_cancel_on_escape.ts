import { useEffect } from 'react';

/** Escape cancels the running test dictation, from anywhere on the page. */
export function useCancelOnEscape(isActive: boolean, cancel: () => void): void {
	useEffect(() => {
		if (!isActive) return;
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') cancel();
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [isActive, cancel]);
}
