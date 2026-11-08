import { Trans, useLingui } from '@lingui/react/macro';
import { Button } from '@minimalstuff/ui';
import type { Ref } from 'react';

import type { RowStatus } from '~/correction_suggestions/review/use_row_statuses';
import type { ReviewItem } from '~/correction_suggestions/shared/build_review_list';

type ReviewRowActionsProps = {
	item: ReviewItem;
	status: RowStatus | undefined;
	isFull: boolean;
	rememberButtonRef?: Ref<HTMLButtonElement>;
	onRemember: (item: ReviewItem) => void;
	onDismiss: (item: ReviewItem) => void;
};

export function ReviewRowActions({
	item,
	status,
	isFull,
	rememberButtonRef,
	onRemember,
	onDismiss,
}: Readonly<ReviewRowActionsProps>) {
	const { t } = useLingui();
	const { heard, written } = item;

	if (status === 'remembered') {
		return (
			<p className="text-sm text-muted">
				<Trans>Remembered</Trans>
			</p>
		);
	}
	if (status === 'dismissed') {
		return (
			<p className="text-sm text-muted">
				<Trans>Dismissed</Trans>
			</p>
		);
	}

	const handleRemember = () => onRemember(item);
	const handleDismiss = () => onDismiss(item);

	return (
		<div className="flex gap-2">
			<Button
				ref={rememberButtonRef}
				size="sm"
				loading={status === 'remembering'}
				disabled={isFull || status === 'dismissing'}
				aria-label={t`Remember ${written} for ${heard}`}
				onClick={handleRemember}
			>
				<Trans>Remember</Trans>
			</Button>
			<Button
				size="sm"
				variant="ghost"
				data-action="dismiss"
				loading={status === 'dismissing'}
				disabled={status === 'remembering'}
				aria-label={t`Dismiss ${written} for ${heard}`}
				onClick={handleDismiss}
			>
				<Trans>Dismiss</Trans>
			</Button>
		</div>
	);
}
