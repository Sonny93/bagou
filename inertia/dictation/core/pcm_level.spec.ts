import { describe, expect, it } from 'vitest';

import { floatToPcm16 } from './float_to_pcm16';
import { pcmLevel } from './pcm_level';

describe('pcmLevel', () => {
	it('should be 0 for silence and for no samples', () => {
		expect(pcmLevel(floatToPcm16(new Float32Array(10)))).toBe(0);
		expect(pcmLevel(new Uint8Array(0))).toBe(0);
	});

	it('should be close to 1 for a full-scale signal', () => {
		const loud = floatToPcm16(new Float32Array(10).fill(1));

		expect(pcmLevel(loud)).toBeCloseTo(1, 3);
	});

	it('should be the RMS of the samples', () => {
		const half = floatToPcm16(new Float32Array(10).fill(0.5));

		expect(pcmLevel(half)).toBeCloseTo(0.5, 3);
	});
});
