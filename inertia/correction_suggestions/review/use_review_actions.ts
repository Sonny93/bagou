import { useEffect, useRef, type RefObject } from 'react';

import { focusRowAction } from '~/correction_suggestions/review/focus_row_action';
import { focusRowDismiss } from '~/correction_suggestions/review/focus_row_dismiss';
import type { UseResolveSuggestionsReturn } from '~/correction_suggestions/review/use_resolve_suggestions';
import type { ReviewItem } from '~/correction_suggestions/shared/build_review_list';
import { findNextUnresolvedKey } from '~/correction_suggestions/shared/find_next_unresolved_key';

type UseReviewActionsOptions = {
	rows: readonly ReviewItem[];
	review: UseResolveSuggestionsReturn;
	focusFallback: () => void;
};

type UseReviewActionsReturn = {
	listRef: RefObject<HTMLUListElement | null>;
	handleRemember: (item: ReviewItem) => void;
	handleDismiss: (item: ReviewItem) => void;
};

/**
 * Runs the Remember and Dismiss buttons of a review list and keeps the focus
 * on the work: after each result it goes to the Remember button of the next
 * row still to review, then to `focusFallback`. When the list turns out to be
 * full, the Remember buttons go off, so the focus moves to the Dismiss button
 * of the same row once they have (the key waits in a ref from the click, and
 * the effect uses it when the list is full).
 */
export function useReviewActions({
	rows,
	review,
	focusFallback,
}: Readonly<UseReviewActionsOptions>): UseReviewActionsReturn {
	const listRef = useRef<HTMLUListElement>(null);
	const dismissFocusKeyRef = useRef<string | null>(null);

	useEffect(() => {
		const key = dismissFocusKeyRef.current;
		if (key === null || !review.isFull) return;
		dismissFocusKeyRef.current = null;
		focusRowDismiss(listRef.current, key);
	});

	const moveFocusFrom = (key: string) => {
		const rowKeys = rows.map((row) => row.key);
		const nextKey = findNextUnresolvedKey(
			rowKeys,
			new Set([...review.getResolvedKeys(), ...review.getBusyKeys()]),
			key
		);
		if (nextKey === null) focusFallback();
		else focusRowAction(listRef.current, nextKey);
	};

	const remember = async (item: ReviewItem) => {
		dismissFocusKeyRef.current = item.key;
		const outcome = await review.remember(item);
		if (outcome !== 'full') dismissFocusKeyRef.current = null;
		if (outcome === 'resolved') moveFocusFrom(item.key);
	};

	const dismiss = async (item: ReviewItem) => {
		if ((await review.dismiss(item)) === 'resolved') moveFocusFrom(item.key);
	};

	const handleRemember = (item: ReviewItem) => void remember(item);
	const handleDismiss = (item: ReviewItem) => void dismiss(item);

	return { listRef, handleRemember, handleDismiss };
}
