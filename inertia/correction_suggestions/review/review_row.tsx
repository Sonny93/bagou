import { Trans } from '@lingui/react/macro';
import type { Ref } from 'react';

import { ReviewRowActions } from '~/correction_suggestions/review/review_row_actions';
import { ReviewRowMeta } from '~/correction_suggestions/review/review_row_meta';
import type { RowStatus } from '~/correction_suggestions/review/use_row_statuses';
import type { ReviewItem } from '~/correction_suggestions/shared/build_review_list';

type ReviewRowProps = {
	item: ReviewItem;
	now: Date;
	status: RowStatus | undefined;
	isFull: boolean;
	rememberButtonRef?: Ref<HTMLButtonElement>;
	onRemember: (item: ReviewItem) => void;
	onDismiss: (item: ReviewItem) => void;
};

export function ReviewRow({
	item,
	now,
	status,
	isFull,
	rememberButtonRef,
	onRemember,
	onDismiss,
}: Readonly<ReviewRowProps>) {
	const { heard, written } = item;

	return (
		<li
			data-key={item.key}
			className="flex flex-col gap-2 border-t border-line py-3 first:border-t-0"
		>
			<p className="[overflow-wrap:anywhere]">
				<strong className="font-semibold">{written}</strong>{' '}
				<span className="text-muted">
					<Trans>instead of “{heard}”</Trans>
				</span>
			</p>
			<ReviewRowMeta item={item} now={now} />
			<ReviewRowActions
				item={item}
				status={status}
				isFull={isFull}
				rememberButtonRef={rememberButtonRef}
				onRemember={onRemember}
				onDismiss={onDismiss}
			/>
		</li>
	);
}
