import { describe, expect, it } from 'vitest';

import { describeSuggestionDate } from '~/correction_suggestions/shared/describe_suggestion_date';

const NOW = new Date(2026, 10, 7, 15, 30);

describe('describeSuggestionDate', () => {
	it('should say the suggestion comes from this dictation when it has no date', () => {
		expect(describeSuggestionDate(null, NOW, 'en')).toEqual({
			kind: 'session',
		});
	});

	it('should say today when the suggestion was created earlier the same day', () => {
		const createdAt = new Date(2026, 10, 7, 0, 5).toISOString();

		expect(describeSuggestionDate(createdAt, NOW, 'en')).toEqual({
			kind: 'today',
		});
	});

	it('should say yesterday when the suggestion was created the day before, even a few hours ago', () => {
		const createdAt = new Date(2026, 10, 6, 23, 59).toISOString();

		expect(describeSuggestionDate(createdAt, NOW, 'en')).toEqual({
			kind: 'yesterday',
		});
	});

	it('should give a short date in the locale when the suggestion is older', () => {
		const createdAt = new Date(2026, 10, 2, 9, 0).toISOString();

		expect(describeSuggestionDate(createdAt, NOW, 'en')).toEqual({
			kind: 'date',
			text: 'Nov 2',
		});
		expect(describeSuggestionDate(createdAt, NOW, 'fr')).toEqual({
			kind: 'date',
			text: '2 nov.',
		});
	});

	it('should add the year when the suggestion is from another year', () => {
		const createdAt = new Date(2025, 11, 30, 9, 0).toISOString();

		expect(describeSuggestionDate(createdAt, NOW, 'en')).toEqual({
			kind: 'date',
			text: 'Dec 30, 2025',
		});
	});
});
