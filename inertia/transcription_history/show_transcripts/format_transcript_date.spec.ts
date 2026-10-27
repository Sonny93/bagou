import { describe, expect, it } from 'vitest';

import { formatTranscriptDate } from './format_transcript_date';

const ISO_DATE = '2026-03-12T14:32:00.000Z';

describe('formatTranscriptDate', () => {
	it('should format an ISO date as a short date with the time in the given locale', () => {
		const formatted = formatTranscriptDate(ISO_DATE, 'fr');

		expect(formatted).toMatch(/12 mars 2026/);
		expect(formatted).toMatch(/\d{2}:\d{2}/);
	});

	it('should follow the English month name when the locale is English', () => {
		expect(formatTranscriptDate(ISO_DATE, 'en')).toMatch(/Mar 12, 2026/);
	});
});
