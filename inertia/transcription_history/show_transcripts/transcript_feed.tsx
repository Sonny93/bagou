import type { Data } from '@generated/data';
import { InfiniteScroll } from '@inertiajs/react';

import { TranscriptFlatList } from './transcript_flat_list';
import { TranscriptGroupedList } from './transcript_grouped_list';
import { TranscriptLoadingStatus } from './transcript_loading_status';

type TranscriptFeedProps = {
	transcripts: Data.Transcript[];
	isSearching: boolean;
	onDelete: (transcript: Data.Transcript) => void;
};

export const TranscriptFeed = ({
	transcripts,
	isSearching,
	onDelete,
}: Readonly<TranscriptFeedProps>) => {
	const TranscriptList = isSearching
		? TranscriptFlatList
		: TranscriptGroupedList;

	return (
		<InfiniteScroll
			data="transcripts"
			as="div"
			onlyNext
			preserveUrl
			next={TranscriptLoadingStatus}
		>
			<TranscriptList transcripts={transcripts} onDelete={onDelete} />
		</InfiniteScroll>
	);
};
