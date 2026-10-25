/**
 * Globals of the AudioWorkletGlobalScope, which the DOM typings do not
 * declare. Only what the capture processor uses.
 */
declare class AudioWorkletProcessor {
	readonly port: MessagePort;
	constructor();
	process(
		inputs: Float32Array[][],
		outputs: Float32Array[][],
		parameters: Record<string, Float32Array>
	): boolean;
}

declare function registerProcessor(
	name: string,
	processorConstructor: new () => AudioWorkletProcessor
): void;
