import { describe, expect, it } from 'vitest';

import {
	doesVisitLeavePage,
	type LeavableVisit,
} from './does_visit_leave_page';

const buildVisit = (overrides: Partial<LeavableVisit> = {}): LeavableVisit => ({
	url: { pathname: '/' },
	only: [],
	except: [],
	preserveState: false,
	...overrides,
});

describe('doesVisitLeavePage', () => {
	it('should leave when the visit goes to another path', () => {
		const visit = buildVisit({ url: { pathname: '/history' } });

		expect(doesVisitLeavePage(visit, '/')).toBe(true);
	});

	it('should leave when the visit is a full visit to the same path', () => {
		expect(doesVisitLeavePage(buildVisit(), '/')).toBe(true);
	});

	it('should not leave when the visit is a partial reload with only', () => {
		const visit = buildVisit({ only: ['remainingMinutes'] });

		expect(doesVisitLeavePage(visit, '/')).toBe(false);
	});

	it('should not leave when the visit is a partial reload with except', () => {
		const visit = buildVisit({ except: ['passkeys'] });

		expect(doesVisitLeavePage(visit, '/')).toBe(false);
	});

	it('should not leave when the visit keeps the page state', () => {
		const visit = buildVisit({ preserveState: true });

		expect(doesVisitLeavePage(visit, '/')).toBe(false);
	});

	it('should leave when a partial reload goes to another path', () => {
		const visit = buildVisit({
			url: { pathname: '/history' },
			only: ['transcripts'],
		});

		expect(doesVisitLeavePage(visit, '/')).toBe(true);
	});
});
