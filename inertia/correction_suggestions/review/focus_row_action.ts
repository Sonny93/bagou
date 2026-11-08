import { findReviewRow } from '~/correction_suggestions/review/find_review_row';

/** Moves the focus to the first enabled button of the row, the Remember button. */
export const focusRowAction = (list: HTMLElement | null, key: string): void => {
	findReviewRow(list, key)
		?.querySelector<HTMLButtonElement>('button:not([disabled])')
		?.focus();
};
