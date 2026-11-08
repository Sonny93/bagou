import { describe, expect, it } from 'vitest';

import {
	MIN_SUGGESTIONS_REFRESH_INTERVAL_MS,
	shouldRefreshSuggestions,
} from '~/correction_suggestions/show_dictation/should_refresh_suggestions';

const LAST_REFRESH_AT = 1_000_000;
const buildOptions = (
	overrides: Partial<Parameters<typeof shouldRefreshSuggestions>[0]> = {}
) => ({
	now: LAST_REFRESH_AT + MIN_SUGGESTIONS_REFRESH_INTERVAL_MS,
	lastRefreshAt: LAST_REFRESH_AT,
	isDrawerOpen: false,
	isPushing: false,
	...overrides,
});

describe('shouldRefreshSuggestions', () => {
	it('should refresh when the interval has passed and nothing blocks', () => {
		expect(shouldRefreshSuggestions(buildOptions())).toBe(true);
	});

	it('should not refresh when the last refresh is more recent than the interval', () => {
		const now = LAST_REFRESH_AT + MIN_SUGGESTIONS_REFRESH_INTERVAL_MS - 1;

		expect(shouldRefreshSuggestions(buildOptions({ now }))).toBe(false);
	});

	it('should not refresh when the drawer is open', () => {
		expect(shouldRefreshSuggestions(buildOptions({ isDrawerOpen: true }))).toBe(
			false
		);
	});

	it('should not refresh when a push is in flight', () => {
		expect(shouldRefreshSuggestions(buildOptions({ isPushing: true }))).toBe(
			false
		);
	});
});
