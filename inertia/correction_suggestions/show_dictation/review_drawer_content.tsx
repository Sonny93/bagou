import { Trans } from '@lingui/react/macro';
import { useEffect, useRef, useState, type RefObject } from 'react';

import type { ReviewItem } from '~/correction_suggestions/shared/build_review_list';
import { findNextUnresolvedKey } from '~/correction_suggestions/shared/find_next_unresolved_key';
import { ReviewListFullNotice } from '~/correction_suggestions/show_dictation/review_list_full_notice';
import { ReviewRow } from '~/correction_suggestions/show_dictation/review_row';
import { useResolveSuggestions } from '~/correction_suggestions/show_dictation/use_resolve_suggestions';
import type { CorrectionPair } from '~/dictation/core/correction_pair';

type ReviewDrawerContentProps = {
	rows: readonly ReviewItem[];
	closeButtonRef: RefObject<HTMLButtonElement | null>;
	firstRememberRef: RefObject<HTMLButtonElement | null>;
	onResolved: (pair: CorrectionPair) => void;
};

const findRow = (list: HTMLElement | null, key: string): HTMLElement | null => {
	const rows = list?.querySelectorAll<HTMLElement>('[data-key]') ?? [];
	return [...rows].find((candidate) => candidate.dataset.key === key) ?? null;
};

const focusRowAction = (list: HTMLElement | null, key: string): void => {
	findRow(list, key)
		?.querySelector<HTMLButtonElement>('button:not([disabled])')
		?.focus();
};

const focusRowDismiss = (list: HTMLElement | null, key: string): void => {
	findRow(list, key)
		?.querySelector<HTMLButtonElement>('button[data-action="dismiss"]')
		?.focus();
};

/**
 * The rows are the ones seen when the drawer opened, so a row that is done
 * stays in place with its result instead of jumping out. After each result
 * the focus moves on to the next row still to review, then to Close. When
 * the list turns out to be full, the Remember buttons go off, so the focus
 * moves to the Dismiss button of the same row once they have (the key waits
 * in a ref from the click, and the effect uses it when the list is full).
 */
export function ReviewDrawerContent({
	rows,
	closeButtonRef,
	firstRememberRef,
	onResolved,
}: Readonly<ReviewDrawerContentProps>) {
	const listRef = useRef<HTMLUListElement>(null);
	const [now] = useState(() => new Date());
	const review = useResolveSuggestions(onResolved);
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
			review.getResolvedKeys(),
			key
		);
		if (nextKey === null) closeButtonRef.current?.focus();
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

	return (
		<div className="flex flex-col gap-4">
			<p className="text-muted">
				<Trans>
					Remembering a correction helps speech recognition and cleanup next
					time.
				</Trans>
			</p>
			{review.isFull && <ReviewListFullNotice />}
			<ul ref={listRef} className="m-0 list-none p-0">
				{rows.map((item, index) => (
					<ReviewRow
						key={item.key}
						item={item}
						now={now}
						status={review.statuses.get(item.key)}
						isFull={review.isFull}
						rememberButtonRef={index === 0 ? firstRememberRef : undefined}
						onRemember={handleRemember}
						onDismiss={handleDismiss}
					/>
				))}
			</ul>
			<output className="sr-only">{review.announcement}</output>
		</div>
	);
}
