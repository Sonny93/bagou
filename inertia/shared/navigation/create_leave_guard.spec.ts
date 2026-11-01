import { describe, expect, it, vi } from 'vitest';

import { createLeaveGuard } from './create_leave_guard';
import type { LeavableVisit } from './does_visit_leave_page';

const CURRENT_PATHNAME = '/';

const buildVisit = (overrides: Partial<LeavableVisit> = {}): LeavableVisit => ({
	url: { pathname: '/history' },
	only: [],
	except: [],
	preserveState: false,
	...overrides,
});

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

const buildGuard = (confirm: () => Promise<boolean>) => {
	const replayed: LeavableVisit[] = [];
	const guard = createLeaveGuard<LeavableVisit>({
		confirm,
		replay: (visit) => {
			replayed.push(visit);
			expect(guard.shouldAllow(visit)).toBe(true);
		},
		getCurrentPathname: () => CURRENT_PATHNAME,
	});
	return { guard, replayed };
};

describe('createLeaveGuard', () => {
	it('should block a visit that leaves the page', () => {
		const { guard } = buildGuard(() => Promise.resolve(true));

		expect(guard.shouldAllow(buildVisit())).toBe(false);
	});

	it('should allow a visit that stays on the page', () => {
		const confirm = vi.fn<() => Promise<boolean>>(() => Promise.resolve(true));
		const { guard } = buildGuard(confirm);

		const isAllowed = guard.shouldAllow(
			buildVisit({
				url: { pathname: CURRENT_PATHNAME },
				only: ['remainingMinutes'],
			})
		);

		expect(isAllowed).toBe(true);
		expect(confirm).not.toHaveBeenCalled();
	});

	it('should replay the visit once, without intercepting it again, when confirmed', async () => {
		const confirm = vi.fn<() => Promise<boolean>>(() => Promise.resolve(true));
		const { guard, replayed } = buildGuard(confirm);
		const visit = buildVisit();

		guard.shouldAllow(visit);
		await flushPromises();

		expect(replayed).toEqual([visit]);
		expect(confirm).toHaveBeenCalledTimes(1);
	});

	it('should not replay the visit when the confirmation is declined', async () => {
		const { guard, replayed } = buildGuard(() => Promise.resolve(false));

		guard.shouldAllow(buildVisit());
		await flushPromises();

		expect(replayed).toEqual([]);
	});

	it('should not open a second confirmation while one is open', async () => {
		const confirm = vi.fn<() => Promise<boolean>>(
			() => new Promise<boolean>(() => undefined)
		);
		const { guard } = buildGuard(confirm);

		const isSecondAllowed = guard.shouldAllow(buildVisit());
		guard.shouldAllow(buildVisit({ url: { pathname: '/settings' } }));
		await flushPromises();

		expect(isSecondAllowed).toBe(false);
		expect(confirm).toHaveBeenCalledTimes(1);
	});

	it('should block again after the replay', async () => {
		const { guard } = buildGuard(() => Promise.resolve(true));
		guard.shouldAllow(buildVisit());
		await flushPromises();

		expect(guard.shouldAllow(buildVisit())).toBe(false);
	});
});
