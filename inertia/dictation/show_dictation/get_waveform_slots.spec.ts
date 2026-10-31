import { describe, expect, it } from 'vitest';

import { getWaveformSlots } from './get_waveform_slots';

describe('getWaveformSlots', () => {
	it('should pad on the left with silence when there are fewer levels than slots', () => {
		expect(getWaveformSlots([0.1, 0.2], 4)).toEqual([0, 0, 0.1, 0.2]);
	});

	it('should keep only the newest levels when there are more levels than slots', () => {
		expect(getWaveformSlots([0.1, 0.2, 0.3], 2)).toEqual([0.2, 0.3]);
	});

	it('should return no slots when the slot count is zero', () => {
		expect(getWaveformSlots([0.1, 0.2], 0)).toEqual([]);
	});
});
