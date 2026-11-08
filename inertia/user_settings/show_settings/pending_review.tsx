import { Trans } from '@lingui/react/macro';
import { useEffect, useId, useState } from 'react';

import { ReviewRow } from '~/correction_suggestions/review/review_row';
import { useResolveSuggestions } from '~/correction_suggestions/review/use_resolve_suggestions';
import { useRetainedReviewRows } from '~/correction_suggestions/review/use_retained_review_rows';
import { useReviewActions } from '~/correction_suggestions/review/use_review_actions';
import type { PendingSuggestion } from '~/correction_suggestions/shared/pending_suggestion';
import { PendingReviewFullNotice } from '~/user_settings/show_settings/pending_review_full_notice';
import { reloadCorrections } from '~/user_settings/show_settings/reload_corrections';

type PendingReviewProps = {
	pendingSuggestions: readonly PendingSuggestion[];
	correctionsCount: number;
	onAnnounce: (message: string) => void;
	onFocusHeading: () => void;
};

/**
 * The corrections Bagou noticed, to remember or dismiss from the settings.
 * A row stays with its result after the lists reload, and the focus moves to
 * the next row to review, then to the section heading.
 */
export function PendingReview({
	pendingSuggestions,
	correctionsCount,
	onAnnounce,
	onFocusHeading,
}: Readonly<PendingReviewProps>) {
	const headingId = useId();
	const [now] = useState(() => new Date());
	const review = useResolveSuggestions({
		onResolved: () => void reloadCorrections(),
		onAnnounce,
	});
	const rows = useRetainedReviewRows(
		pendingSuggestions,
		review.getResolvedKeys
	);
	const { listRef, handleRemember, handleDismiss } = useReviewActions({
		rows,
		review,
		focusFallback: onFocusHeading,
	});
	const { clearFull } = review;

	useEffect(() => clearFull(), [correctionsCount, clearFull]);

	if (rows.length === 0) return null;

	return (
		<section className="flex flex-col gap-2" aria-labelledby={headingId}>
			<h3 id={headingId} className="text-lg font-semibold">
				<Trans>To review</Trans>
			</h3>
			<p className="text-muted">
				<Trans>
					Corrections Bagou noticed in your edits. Remember the ones you want it
					to learn.
				</Trans>
			</p>
			{review.isFull && <PendingReviewFullNotice />}
			<ul ref={listRef} className="m-0 list-none p-0">
				{rows.map((item) => (
					<ReviewRow
						key={item.key}
						item={item}
						now={now}
						status={review.statuses.get(item.key)}
						isFull={review.isFull}
						onRemember={handleRemember}
						onDismiss={handleDismiss}
					/>
				))}
			</ul>
		</section>
	);
}
