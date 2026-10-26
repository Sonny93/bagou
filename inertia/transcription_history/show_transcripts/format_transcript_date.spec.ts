import { describe, expect, it } from 'vitest';

import { formatTranscriptDate } from './format_transcript_date';

describe('formatTranscriptDate', () => {
	it('should format an ISO date as a short French date with the time', () => {
		const formatted = formatTranscriptDate('2026-03-12T14:32:00.000Z');

		expect(formatted).toMatch(/12 mars 2026/);
		expect(formatted).toMatch(/\d{2}:\d{2}/);
	});
});
