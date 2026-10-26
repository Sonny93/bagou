import type { DateTime } from 'luxon';

export type TranscriptSearch = {
	userId: number;
	since: DateTime;
	query: string | null;
	page: number;
	perPage: number;
};
