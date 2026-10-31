import { describe, expect, it } from 'vitest';

import { getWaveformSlotCount } from './get_waveform_slot_count';

describe('getWaveformSlotCount', () => {
	it('should count the bars that fit with their gaps', () => {
		expect(getWaveformSlotCount(10)).toBe(3);
	});

	it('should return zero slots when the width is zero', () => {
		expect(getWaveformSlotCount(0)).toBe(0);
	});
});
