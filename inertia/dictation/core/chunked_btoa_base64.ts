const CHUNK_BYTE_LENGTH = 0x8000;

/**
 * Base64 through `btoa`, for browsers without `Uint8Array.prototype.toBase64`.
 * Chunked so `String.fromCharCode` never receives too many arguments.
 */
export function chunkedBtoaBase64(bytes: Uint8Array): string {
	let binary = '';
	for (let offset = 0; offset < bytes.length; offset += CHUNK_BYTE_LENGTH) {
		binary += String.fromCharCode(
			...bytes.subarray(offset, offset + CHUNK_BYTE_LENGTH)
		);
	}
	return btoa(binary);
}
