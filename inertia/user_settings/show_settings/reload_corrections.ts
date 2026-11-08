import { router } from '@inertiajs/react';

/** Reloads only the corrections and the suggestions to review of the page, so the unsaved edits of the settings form stay as they are. */
export function reloadCorrections(): Promise<void> {
	return new Promise((resolve) => {
		router.reload({
			only: [
				'corrections',
				'correctionsBeyondSpeechLimit',
				'pendingSuggestions',
			],
			onFinish: () => resolve(),
		});
	});
}
