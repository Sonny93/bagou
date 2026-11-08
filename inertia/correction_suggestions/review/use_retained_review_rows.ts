import { useState } from 'react';

import { retainResolvedRows } from '~/correction_suggestions/review/retain_resolved_rows';
import {
	buildReviewList,
	type ReviewItem,
} from '~/correction_suggestions/shared/build_review_list';
import type { PendingSuggestion } from '~/correction_suggestions/shared/pending_suggestion';

/** The suggestions the server holds as review rows, where a row resolved here stays with its result until the page is left. */
export function useRetainedReviewRows(
	pendingSuggestions: readonly PendingSuggestion[],
	getResolvedKeys: () => ReadonlySet<string>
): readonly ReviewItem[] {
	const [source, setSource] = useState(pendingSuggestions);
	const [rows, setRows] = useState(() =>
		buildReviewList(pendingSuggestions, [])
	);

	if (source !== pendingSuggestions) {
		setSource(pendingSuggestions);
		setRows(
			retainResolvedRows(
				rows,
				buildReviewList(pendingSuggestions, []),
				getResolvedKeys()
			)
		);
	}

	return rows;
}
