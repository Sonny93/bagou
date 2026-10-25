import { describe, expect, it } from 'vitest';

import { bytesToBase64 } from './bytes_to_base64';
import { chunkedBtoaBase64 } from './chunked_btoa_base64';

const bytesOf = (length: number): Uint8Array =>
	Uint8Array.from({ length }, (_, index) => (index * 7) % 256);

const expectedBase64 = (bytes: Uint8Array): string =>
	Buffer.from(bytes).toString('base64');

describe('chunkedBtoaBase64', () => {
	it.each([0, 1, 2, 3, 3200, 0x8000, 0x8000 + 1, 100_000])(
		'should encode %i bytes like Buffer does',
		(length) => {
			const bytes = bytesOf(length);

			expect(chunkedBtoaBase64(bytes)).toBe(expectedBase64(bytes));
		}
	);
});

describe('bytesToBase64', () => {
	it('should encode a PCM frame to the same base64 as the fallback', () => {
		const frame = bytesOf(3200);

		expect(bytesToBase64(frame)).toBe(chunkedBtoaBase64(frame));
	});

	it('should use the fallback when the runtime has no native toBase64', () => {
		const frame = bytesOf(10);
		Object.defineProperty(frame, 'toBase64', { value: undefined });

		expect(bytesToBase64(frame)).toBe(expectedBase64(frame));
	});
});
