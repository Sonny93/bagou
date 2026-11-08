import { findReviewRow } from '~/correction_suggestions/review/find_review_row';

/** Moves the focus to the Dismiss button of the row. */
export const focusRowDismiss = (
	list: HTMLElement | null,
	key: string
): void => {
	findReviewRow(list, key)
		?.querySelector<HTMLButtonElement>('button[data-action="dismiss"]')
		?.focus();
};
