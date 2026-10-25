type CborValue =
	| number
	| string
	| Uint8Array
	| ReadonlyMap<CborValue, CborValue>;

const MAJOR_UNSIGNED = 0;
const MAJOR_NEGATIVE = 1;
const MAJOR_BYTES = 2;
const MAJOR_TEXT = 3;
const MAJOR_MAP = 5;

function encodeHead(majorType: number, length: number): Buffer {
	const initialByte = majorType << 5;
	if (length < 24) return Buffer.from([initialByte | length]);
	if (length < 256) return Buffer.from([initialByte | 24, length]);
	const head = Buffer.alloc(3);
	head[0] = initialByte | 25;
	head.writeUInt16BE(length, 1);
	return head;
}

/**
 * Minimal CBOR encoder covering what a WebAuthn software authenticator
 * emits: small integers, byte strings, text strings and maps, in the order
 * the entries were given.
 */
export function encodeCbor(value: CborValue): Buffer {
	if (typeof value === 'number') {
		return value >= 0
			? encodeHead(MAJOR_UNSIGNED, value)
			: encodeHead(MAJOR_NEGATIVE, -1 - value);
	}
	if (typeof value === 'string') {
		const text = Buffer.from(value, 'utf8');
		return Buffer.concat([encodeHead(MAJOR_TEXT, text.length), text]);
	}
	if (value instanceof Uint8Array) {
		return Buffer.concat([encodeHead(MAJOR_BYTES, value.length), value]);
	}
	const entries = [...value].flatMap(([key, entry]) => [
		encodeCbor(key),
		encodeCbor(entry),
	]);
	return Buffer.concat([encodeHead(MAJOR_MAP, value.size), ...entries]);
}
