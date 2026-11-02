import type { Data } from '@generated/data';
import { useLingui } from '@lingui/react/macro';

import { formatDayLabel } from '~/transcription_history/show_transcripts/format_day_label';
import { formatTranscriptTime } from '~/transcription_history/show_transcripts/format_transcript_time';
import type { TranscriptDayGroup as TranscriptDayGroupData } from '~/transcription_history/show_transcripts/group_transcripts_by_day';
import { TranscriptRow } from '~/transcription_history/show_transcripts/transcript_row';

type TranscriptDayGroupProps = {
	group: TranscriptDayGroupData;
	now: Date;
	locale: string;
	onDelete: (transcript: Data.Transcript) => void;
};

export function TranscriptDayGroup({
	group,
	now,
	locale,
	onDelete,
}: Readonly<TranscriptDayGroupProps>) {
	const { t } = useLingui();
	const dayLabel = formatDayLabel(group.day, now, locale);
	const rows = group.transcripts.map((transcript) => {
		const time = formatTranscriptTime(transcript.createdAt, locale);
		return { transcript, time, dateLabel: t`${dayLabel} at ${time}` };
	});

	return (
		<div className="flex flex-col gap-3 sm:gap-4">
			<h2 className="text-lg font-semibold text-ink sm:text-xl">{dayLabel}</h2>
			<ul className="flex flex-col gap-4">
				{rows.map(({ transcript, time, dateLabel }) => (
					<TranscriptRow
						key={transcript.id}
						dateLabel={dateLabel}
						accessibleDate={time}
						transcript={transcript}
						onDelete={onDelete}
					/>
				))}
			</ul>
		</div>
	);
}
