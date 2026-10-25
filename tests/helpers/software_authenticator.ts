import type {
	AuthenticationResponseJSON,
	PublicKeyCredentialCreationOptionsJSON,
	PublicKeyCredentialRequestOptionsJSON,
	RegistrationResponseJSON,
} from '@simplewebauthn/server';
import {
	createHash,
	generateKeyPairSync,
	randomBytes,
	sign,
	type KeyObject,
} from 'node:crypto';

import { encodeCbor } from '#tests/helpers/encode_cbor';

const FLAG_USER_PRESENT = 0x01;
const FLAG_USER_VERIFIED = 0x04;
const FLAG_ATTESTED_CREDENTIAL = 0x40;
const COSE_KEY_TYPE_EC2 = 2;
const COSE_ALGORITHM_ES256 = -7;
const COSE_CURVE_P256 = 1;
const CREDENTIAL_ID_BYTE_LENGTH = 32;
const AAGUID = Buffer.alloc(16);

type SoftwareAuthenticatorConfig = {
	origin: string;
	rpId: string;
};

type AssertionOptions = {
	isUserVerified?: boolean;
	counter?: number;
};

const sha256 = (value: Uint8Array | string): Buffer =>
	createHash('sha256').update(value).digest();

const toBase64Url = (value: Uint8Array): string =>
	Buffer.from(value).toString('base64url');

const buildCounterBytes = (counter: number): Buffer => {
	const bytes = Buffer.alloc(4);
	bytes.writeUInt32BE(counter);
	return bytes;
};

/**
 * A platform authenticator implemented with real cryptography (ES256), so
 * the real WebauthnService can verify its output end to end.
 */
export class SoftwareAuthenticator {
	private readonly privateKey: KeyObject;
	private readonly coseKey: Buffer;
	private readonly credentialId = randomBytes(CREDENTIAL_ID_BYTE_LENGTH);
	private counter = 0;

	constructor(private readonly config: Readonly<SoftwareAuthenticatorConfig>) {
		const { privateKey, publicKey } = generateKeyPairSync('ec', {
			namedCurve: 'P-256',
		});
		const { x, y } = publicKey.export({ format: 'jwk' });
		this.privateKey = privateKey;
		this.coseKey = encodeCbor(
			new Map<number, number | Uint8Array>([
				[1, COSE_KEY_TYPE_EC2],
				[3, COSE_ALGORITHM_ES256],
				[-1, COSE_CURVE_P256],
				[-2, Buffer.from(x ?? '', 'base64url')],
				[-3, Buffer.from(y ?? '', 'base64url')],
			])
		);
	}

	get credentialIdBase64Url(): string {
		return toBase64Url(this.credentialId);
	}

	createCredential(
		options: Readonly<PublicKeyCredentialCreationOptionsJSON>
	): RegistrationResponseJSON {
		const clientDataJSON = this.buildClientData('webauthn.create', options);
		const authenticatorData = this.buildAuthenticatorData({
			flags: FLAG_USER_PRESENT | FLAG_USER_VERIFIED | FLAG_ATTESTED_CREDENTIAL,
			counter: 0,
			attestedCredentialData: this.buildAttestedCredentialData(),
		});
		const attestationObject = encodeCbor(
			new Map<string, string | Uint8Array | Map<string, string>>([
				['fmt', 'none'],
				['attStmt', new Map()],
				['authData', authenticatorData],
			])
		);
		return {
			id: this.credentialIdBase64Url,
			rawId: this.credentialIdBase64Url,
			type: 'public-key',
			authenticatorAttachment: 'platform',
			clientExtensionResults: {},
			response: {
				clientDataJSON: toBase64Url(clientDataJSON),
				attestationObject: toBase64Url(attestationObject),
				transports: ['internal'],
			},
		};
	}

	createAssertion(
		options: Readonly<PublicKeyCredentialRequestOptionsJSON>,
		{ isUserVerified = true, counter }: Readonly<AssertionOptions> = {}
	): AuthenticationResponseJSON {
		this.counter = counter ?? this.counter + 1;
		const clientDataJSON = this.buildClientData('webauthn.get', options);
		const authenticatorData = this.buildAuthenticatorData({
			flags: FLAG_USER_PRESENT | (isUserVerified ? FLAG_USER_VERIFIED : 0),
			counter: this.counter,
		});
		const signature = sign(
			'sha256',
			Buffer.concat([authenticatorData, sha256(clientDataJSON)]),
			this.privateKey
		);
		return {
			id: this.credentialIdBase64Url,
			rawId: this.credentialIdBase64Url,
			type: 'public-key',
			authenticatorAttachment: 'platform',
			clientExtensionResults: {},
			response: {
				clientDataJSON: toBase64Url(clientDataJSON),
				authenticatorData: toBase64Url(authenticatorData),
				signature: toBase64Url(signature),
			},
		};
	}

	private buildClientData(
		type: 'webauthn.create' | 'webauthn.get',
		options: Readonly<{ challenge: string }>
	): Buffer {
		return Buffer.from(
			JSON.stringify({
				type,
				challenge: options.challenge,
				origin: this.config.origin,
				crossOrigin: false,
			})
		);
	}

	private buildAuthenticatorData({
		flags,
		counter,
		attestedCredentialData = Buffer.alloc(0),
	}: Readonly<{
		flags: number;
		counter: number;
		attestedCredentialData?: Buffer;
	}>): Buffer {
		return Buffer.concat([
			sha256(this.config.rpId),
			Buffer.from([flags]),
			buildCounterBytes(counter),
			attestedCredentialData,
		]);
	}

	private buildAttestedCredentialData(): Buffer {
		const credentialIdLength = Buffer.alloc(2);
		credentialIdLength.writeUInt16BE(this.credentialId.length);
		return Buffer.concat([
			AAGUID,
			credentialIdLength,
			this.credentialId,
			this.coseKey,
		]);
	}
}
