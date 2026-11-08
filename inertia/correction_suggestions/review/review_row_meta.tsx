import { Link } from '@adonisjs/inertia/react';
import { useLingui } from '@lingui/react/macro';

import type { ReviewItem } from '~/correction_suggestions/shared/build_review_list';
import { describeSuggestionDate } from '~/correction_suggestions/shared/describe_suggestion_date';

type ReviewRowMetaProps = {
	item: ReviewItem;
	now: Date;
};

export function ReviewRowMeta({ item, now }: Readonly<ReviewRowMetaProps>) {
	const { t, i18n } = useLingui();
	const { written } = item;
	const date = describeSuggestionDate(item.createdAt, now, i18n.locale);

	const describeDate = (): string => {
		switch (date.kind) {
			case 'date':
				return date.text;
			case 'today':
				return t`Today`;
			case 'yesterday':
				return t`Yesterday`;
			case 'session':
				return t`This dictation`;
		}
	};

	return (
		<p className="flex flex-wrap items-center gap-x-3 text-xs text-muted">
			<span>{describeDate()}</span>
			<Link
				route="transcription_history.show_transcripts"
				qs={{ q: written }}
				className="underline"
				aria-label={t`See in history: ${written}`}
			>
				{t`See in history`}
			</Link>
		</p>
	);
}
