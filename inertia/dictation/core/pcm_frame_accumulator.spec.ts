import { describe, expect, it } from 'vitest';

import { PcmFrameAccumulator } from './pcm_frame_accumulator';

const FRAME_BYTES = 8;

const sequence = (length: number, start = 0): Uint8Array =>
	Uint8Array.from({ length }, (_, index) => (start + index) % 256);

describe('PcmFrameAccumulator', () => {
	it('should emit nothing until a whole frame is buffered', () => {
		const accumulator = new PcmFrameAccumulator(FRAME_BYTES);

		expect(accumulator.push(sequence(6))).toEqual([]);
	});

	it('should emit exact frames across uneven blocks without losing a byte', () => {
		const accumulator = new PcmFrameAccumulator(FRAME_BYTES);
		const blockSizes = [6, 6, 1, 20, 3];
		let offset = 0;
		const frames = blockSizes.flatMap((size) => {
			const block = sequence(size, offset);
			offset += size;
			return accumulator.push(block);
		});

		expect(frames.every((frame) => frame.length === FRAME_BYTES)).toBe(true);
		expect(frames.flatMap((frame) => [...frame])).toEqual([...sequence(32)]);
		expect([...(accumulator.flush() ?? [])]).toEqual([...sequence(4, 32)]);
	});

	it('should emit several frames from one large block', () => {
		const accumulator = new PcmFrameAccumulator(FRAME_BYTES);

		expect(accumulator.push(sequence(24))).toHaveLength(3);
		expect(accumulator.flush()).toBeUndefined();
	});

	it('should return an independent copy of each frame', () => {
		const accumulator = new PcmFrameAccumulator(FRAME_BYTES);
		const block = sequence(FRAME_BYTES);

		const [frame] = accumulator.push(block);
		block.fill(0);

		expect([...(frame ?? [])]).toEqual([...sequence(FRAME_BYTES)]);
	});

	it('should empty the buffer when flushed', () => {
		const accumulator = new PcmFrameAccumulator(FRAME_BYTES);
		accumulator.push(sequence(3));

		accumulator.flush();

		expect(accumulator.flush()).toBeUndefined();
	});
});
