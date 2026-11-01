import { describe, expect, it } from 'vitest';

import { getLeaveRisk } from './get_leave_risk';

describe('getLeaveRisk', () => {
	it.each([
		'connecting',
		'recording',
		'finishing',
		'cleaning',
		'recleaning',
	] as const)(
		'should return dictation-in-progress when the status is %s and the draft is saved',
		(status) => {
			expect(getLeaveRisk(status, 'saved')).toBe('dictation-in-progress');
		}
	);

	it('should return dictation-in-progress when the first dictation runs on a blank draft', () => {
		expect(getLeaveRisk('recording', 'none')).toBe('dictation-in-progress');
	});

	it('should return null when the page is idle with a saved draft', () => {
		expect(getLeaveRisk('idle', 'saved')).toBeNull();
	});

	it('should return null when the draft is blank', () => {
		expect(getLeaveRisk('done', 'none')).toBeNull();
	});

	it('should return unsaved-text when the draft is not saved', () => {
		expect(getLeaveRisk('done', 'pending')).toBe('unsaved-text');
	});

	it('should return dictation-in-progress when a dictation runs over an unsaved draft', () => {
		expect(getLeaveRisk('recording', 'pending')).toBe('dictation-in-progress');
	});
});
