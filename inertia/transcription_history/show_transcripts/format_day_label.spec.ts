import { describe, expect, it } from 'vitest';

import { formatDayLabel } from '~/transcription_history/show_transcripts/format_day_label';

const NOW = new Date(2026, 10, 1, 9, 30);

function localDay(year: number, month: number, day: number, hour = 12): Date {
	return new Date(year, month - 1, day, hour);
}

describe('formatDayLabel', () => {
	it('should say today for the current day in English', () => {
		expect(formatDayLabel(localDay(2026, 11, 1, 0), NOW, 'en')).toBe('Today');
	});

	it('should say yesterday for the previous day in English', () => {
		expect(formatDayLabel(localDay(2026, 10, 31, 23), NOW, 'en')).toBe(
			'Yesterday'
		);
	});

	it('should say 2 days ago for the day before yesterday in English', () => {
		expect(formatDayLabel(localDay(2026, 10, 30), NOW, 'en')).toBe(
			'2 days ago'
		);
	});

	it('should use French relative words and capitalize them', () => {
		expect(formatDayLabel(localDay(2026, 11, 1), NOW, 'fr')).toBe(
			'Aujourd’hui'
		);
		expect(formatDayLabel(localDay(2026, 10, 31), NOW, 'fr')).toBe('Hier');
		expect(formatDayLabel(localDay(2026, 10, 30), NOW, 'fr')).toBe(
			'Avant-hier'
		);
	});

	it('should show the date from 3 days ago on', () => {
		expect(formatDayLabel(localDay(2026, 10, 29), NOW, 'en')).toBe(
			'October 29'
		);
	});

	it('should show day and month for an earlier date this year', () => {
		expect(formatDayLabel(localDay(2026, 3, 5), NOW, 'fr')).toBe('5 mars');
	});

	it('should add the year for a date last year', () => {
		expect(formatDayLabel(localDay(2025, 12, 25), NOW, 'en')).toBe(
			'December 25, 2025'
		);
	});

	it('should count a future date as today', () => {
		expect(formatDayLabel(localDay(2026, 11, 3), NOW, 'en')).toBe('Today');
	});
});
