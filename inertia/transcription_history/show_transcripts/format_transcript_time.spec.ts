import { describe, expect, it } from 'vitest';

import { formatTranscriptTime } from '~/transcription_history/show_transcripts/format_transcript_time';

describe('formatTranscriptTime', () => {
	it('should format an ISO date as a short time without the date', () => {
		const formatted = formatTranscriptTime('2026-03-12T14:32:00.000Z', 'fr');

		expect(formatted).toMatch(/^\d{2}:\d{2}$/);
	});
});
