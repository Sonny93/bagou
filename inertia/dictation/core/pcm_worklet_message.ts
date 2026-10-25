/** Messages posted by the capture worklet to the main thread. */
export type PcmWorkletMessage =
	| { type: 'frame'; frame: ArrayBuffer; level: number }
	| { type: 'flushed' };

/** Messages the main thread posts to the capture worklet. */
export type PcmWorkletCommand = { type: 'flush' };
