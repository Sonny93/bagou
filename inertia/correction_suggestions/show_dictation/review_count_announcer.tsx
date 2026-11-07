import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';

import { describeReviewCount } from '~/correction_suggestions/show_dictation/describe_review_count';

type ReviewCountAnnouncerProps = {
	count: number;
};

/** Always mounted, so a suggestion that arrives is read out once; a count that shrinks says nothing. */
export function ReviewCountAnnouncer({
	count,
}: Readonly<ReviewCountAnnouncerProps>) {
	const { i18n } = useLingui();
	const [previousCount, setPreviousCount] = useState(count);
	const [announcement, setAnnouncement] = useState('');

	if (count !== previousCount) {
		setPreviousCount(count);
		if (count > previousCount) {
			setAnnouncement(describeReviewCount(count, i18n));
		}
	}

	return <output className="sr-only">{announcement}</output>;
}
