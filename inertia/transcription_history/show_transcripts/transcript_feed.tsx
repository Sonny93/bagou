import type { Data } from '@generated/data';
import { InfiniteScroll } from '@inertiajs/react';

import { TranscriptRow } from './transcript_row';

type TranscriptFeedProps = {
	transcripts: Data.Transcript[];
	onDelete: (transcript: Data.Transcript) => void;
};

export const TranscriptFeed = ({
	transcripts,
	onDelete,
}: Readonly<TranscriptFeedProps>) => (
	<InfiniteScroll
		data="transcripts"
		as="ul"
		onlyNext
		preserveUrl
		className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface"
	>
		{transcripts.map((transcript) => (
			<TranscriptRow
				key={transcript.id}
				transcript={transcript}
				onDelete={onDelete}
			/>
		))}
	</InfiniteScroll>
);
