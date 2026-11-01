import type { Data } from '@generated/data';

export type TranscriptDayGroup = {
	dayKey: string;
	day: Date;
	transcripts: Data.Transcript[];
};

const DATE_PART_LENGTH = 2;

function pad(value: number): string {
	return String(value).padStart(DATE_PART_LENGTH, '0');
}

function toDayKey(date: Date): string {
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function groupTranscriptsByDay(
	transcripts: readonly Data.Transcript[]
): TranscriptDayGroup[] {
	const groupsByDayKey = new Map<string, TranscriptDayGroup>();

	for (const transcript of transcripts) {
		const day = new Date(transcript.createdAt);
		const dayKey = toDayKey(day);
		const existingGroup = groupsByDayKey.get(dayKey);

		if (existingGroup) {
			existingGroup.transcripts.push(transcript);
			continue;
		}
		groupsByDayKey.set(dayKey, { dayKey, day, transcripts: [transcript] });
	}

	return [...groupsByDayKey.values()];
}
