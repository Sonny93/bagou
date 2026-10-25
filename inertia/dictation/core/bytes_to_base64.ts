import { chunkedBtoaBase64 } from './chunked_btoa_base64';

/** Native `toBase64` when the browser has it (Chrome 140+), `btoa` otherwise. */
export function bytesToBase64(bytes: Uint8Array): string {
	return typeof bytes.toBase64 === 'function'
		? bytes.toBase64()
		: chunkedBtoaBase64(bytes);
}
