import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import { urlFor } from '~/shared/lib/url_for';

const SEARCH_DEBOUNCE_MS = 300;

type UseTranscriptSearchReturn = {
	searchText: string;
	setSearchText: (searchText: string) => void;
};

/**
 * Keeps the typed text locally and, once typing paused, reloads the list for
 * it without piling up browser history entries.
 */
export function useTranscriptSearch(
	appliedQuery: string
): UseTranscriptSearchReturn {
	const [searchText, setSearchText] = useState(appliedQuery);

	useEffect(() => {
		const trimmedText = searchText.trim();
		if (trimmedText === appliedQuery) return;
		const timer = setTimeout(() => {
			router.get(
				urlFor('transcription_history.show_transcripts'),
				trimmedText === '' ? {} : { q: trimmedText },
				{
					preserveState: true,
					replace: true,
					only: ['transcripts', 'query'],
				}
			);
		}, SEARCH_DEBOUNCE_MS);
		return () => clearTimeout(timer);
	}, [searchText, appliedQuery]);

	return { searchText, setSearchText };
}
