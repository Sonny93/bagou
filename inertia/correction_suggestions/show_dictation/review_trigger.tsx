import { useLingui } from '@lingui/react/macro';
import { Button } from '@minimalstuff/ui';
import { useRef } from 'react';

import { describeReviewCount } from '~/correction_suggestions/show_dictation/describe_review_count';
import { useFocusDraftWhenUnmounted } from '~/correction_suggestions/show_dictation/use_focus_draft_when_unmounted';

type ReviewTriggerProps = {
	count: number;
	onClick: () => void;
};

export function ReviewTrigger({
	count,
	onClick,
}: Readonly<ReviewTriggerProps>) {
	const { i18n } = useLingui();
	const buttonRef = useRef<HTMLButtonElement>(null);
	useFocusDraftWhenUnmounted(buttonRef);

	return (
		<div className="mx-auto flex w-full max-w-3xl shrink-0 justify-end px-4 pb-2 sm:px-6">
			<Button
				ref={buttonRef}
				size="sm"
				variant="subtle"
				color="neutral"
				onClick={onClick}
			>
				{describeReviewCount(count, i18n)}
			</Button>
		</div>
	);
}
