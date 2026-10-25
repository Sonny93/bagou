/**
 * Re-cuts a stream of audio blocks of any size into frames of exactly
 * `frameByteLength` bytes, without losing or duplicating a byte.
 */
export class PcmFrameAccumulator {
	#pending: Uint8Array<ArrayBuffer> = new Uint8Array(0);

	constructor(private readonly frameByteLength: number) {}

	push(block: Uint8Array): Uint8Array<ArrayBuffer>[] {
		const buffered = new Uint8Array(this.#pending.length + block.length);
		buffered.set(this.#pending, 0);
		buffered.set(block, this.#pending.length);

		const frames: Uint8Array<ArrayBuffer>[] = [];
		let offset = 0;
		while (buffered.length - offset >= this.frameByteLength) {
			frames.push(buffered.slice(offset, offset + this.frameByteLength));
			offset += this.frameByteLength;
		}
		this.#pending = buffered.slice(offset);
		return frames;
	}

	/** Returns the incomplete trailing frame, if any, and empties the buffer. */
	flush(): Uint8Array<ArrayBuffer> | undefined {
		const remainder = this.#pending;
		this.#pending = new Uint8Array(0);
		return remainder.length > 0 ? remainder : undefined;
	}
}
