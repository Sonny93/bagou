import { Trans } from '@lingui/react/macro';
import { useState, type RefObject } from 'react';

import { ReviewRow } from '~/correction_suggestions/review/review_row';
import { useResolveSuggestions } from '~/correction_suggestions/review/use_resolve_suggestions';
import { useReviewActions } from '~/correction_suggestions/review/use_review_actions';
import type { ReviewItem } from '~/correction_suggestions/shared/build_review_list';
import { ReviewListFullNotice } from '~/correction_suggestions/show_dictation/review_list_full_notice';
import type { CorrectionPair } from '~/dictation/core/correction_pair';

type ReviewDrawerContentProps = {
	rows: readonly ReviewItem[];
	closeButtonRef: RefObject<HTMLButtonElement | null>;
	firstRememberRef: RefObject<HTMLButtonElement | null>;
	onResolved: (pair: CorrectionPair) => void;
};

/**
 * The rows are the ones seen when the drawer opened, so a row that is done
 * stays in place with its result instead of jumping out. After each result
 * the focus moves on to the next row still to review, then to Close.
 */
export function ReviewDrawerContent({
	rows,
	closeButtonRef,
	firstRememberRef,
	onResolved,
}: Readonly<ReviewDrawerContentProps>) {
	const [now] = useState(() => new Date());
	const [announcement, setAnnouncement] = useState('');
	const review = useResolveSuggestions({
		onResolved,
		onAnnounce: setAnnouncement,
	});
	const { listRef, handleRemember, handleDismiss } = useReviewActions({
		rows,
		review,
		focusFallback: () => closeButtonRef.current?.focus(),
	});

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
			<output className="sr-only">{announcement}</output>
		</div>
	);
}
