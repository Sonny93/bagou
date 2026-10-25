import { describe, expect, it } from 'vitest';

import { floatToPcm16 } from './float_to_pcm16';

const readSamples = (bytes: Uint8Array): number[] => {
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	return Array.from({ length: bytes.length / 2 }, (_, index) =>
		view.getInt16(index * 2, true)
	);
};

describe('floatToPcm16', () => {
	it('should map silence and full scale to the signed 16-bit range', () => {
		const pcm = floatToPcm16(new Float32Array([0, 1, -1]));

		expect(readSamples(pcm)).toEqual([0, 32767, -32768]);
	});

	it('should clamp samples outside [-1, 1]', () => {
		const pcm = floatToPcm16(new Float32Array([2.5, -3]));

		expect(readSamples(pcm)).toEqual([32767, -32768]);
	});

	it('should round to the nearest integer', () => {
		const pcm = floatToPcm16(new Float32Array([0.5, -0.5]));

		expect(readSamples(pcm)).toEqual([16384, -16384]);
	});

	it('should write each sample little-endian on two bytes', () => {
		const pcm = floatToPcm16(new Float32Array([1, -1]));

		expect([...pcm]).toEqual([0xff, 0x7f, 0x00, 0x80]);
	});

	it('should produce two bytes per sample', () => {
		expect(floatToPcm16(new Float32Array(128)).byteLength).toBe(256);
	});
});
