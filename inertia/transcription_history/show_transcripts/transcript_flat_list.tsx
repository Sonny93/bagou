import type { Data } from '@generated/data';
import { useLingui } from '@lingui/react/macro';

import { formatTranscriptFullDate } from './format_transcript_full_date';
import { TranscriptRow } from './transcript_row';

type TranscriptFlatListProps = {
	transcripts: Data.Transcript[];
	onDelete: (transcript: Data.Transcript) => void;
};

export function TranscriptFlatList({
	transcripts,
	onDelete,
}: Readonly<TranscriptFlatListProps>) {
	const { i18n } = useLingui();
	const rows = transcripts.map((transcript) => ({
		transcript,
		fullDate: formatTranscriptFullDate(transcript.createdAt, i18n.locale),
	}));

	return (
		<ul className="flex flex-col gap-4">
			{rows.map(({ transcript, fullDate }) => (
				<TranscriptRow
					key={transcript.id}
					dateLabel={fullDate}
					accessibleDate={fullDate}
					transcript={transcript}
					onDelete={onDelete}
				/>
			))}
		</ul>
	);
}
