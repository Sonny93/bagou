import type { Data } from '@generated/data';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';

import { groupTranscriptsByDay } from '~/transcription_history/show_transcripts/group_transcripts_by_day';
import { TranscriptDayGroup } from '~/transcription_history/show_transcripts/transcript_day_group';

type TranscriptGroupedListProps = {
	transcripts: Data.Transcript[];
	onDelete: (transcript: Data.Transcript) => void;
};

export function TranscriptGroupedList({
	transcripts,
	onDelete,
}: Readonly<TranscriptGroupedListProps>) {
	const { i18n } = useLingui();
	const [now] = useState(() => new Date());
	const groups = groupTranscriptsByDay(transcripts);

	return (
		<div className="flex flex-col gap-10 sm:gap-14">
			{groups.map((group) => (
				<TranscriptDayGroup
					key={group.dayKey}
					group={group}
					now={now}
					locale={i18n.locale}
					onDelete={onDelete}
				/>
			))}
		</div>
	);
}
