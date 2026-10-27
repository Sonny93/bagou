import { test } from '@japa/runner';
import { request } from 'node:http';

import env from '#start/env';

const FORBIDDEN_STATUS = 403;
const UNAUTHORIZED_STATUS = 401;
const SOCKET_PATH = '/socket';
const WEBSOCKET_VERSION = '13';
const WEBSOCKET_KEY = 'dGhlIHNhbXBsZSBub25jZQ==';
const appUrl = new URL(env.get('APP_URL'));
const forwardedProtocol = appUrl.protocol === 'https:' ? 'http' : 'https';

function requestUpgradeStatus(
	headers: Readonly<Record<string, string>>
): Promise<number> {
	return new Promise((resolve, reject) => {
		const upgradeRequest = request({
			host: appUrl.hostname,
			port: appUrl.port,
			path: SOCKET_PATH,
			headers: {
				Connection: 'Upgrade',
				Upgrade: 'websocket',
				'Sec-WebSocket-Version': WEBSOCKET_VERSION,
				'Sec-WebSocket-Key': WEBSOCKET_KEY,
				...headers,
			},
		});
		upgradeRequest.on('response', (response) => {
			response.resume();
			resolve(response.statusCode ?? 0);
		});
		upgradeRequest.on('error', reject);
		upgradeRequest.end();
	});
}

test.group('Socket upgrade origin', () => {
	test('should not reject as forbidden when the origin matches APP_URL even if the forwarded protocol disagrees', async ({
		assert,
	}) => {
		const status = await requestUpgradeStatus({
			Origin: appUrl.origin,
			'X-Forwarded-Proto': forwardedProtocol,
		});

		assert.equal(status, UNAUTHORIZED_STATUS);
	});

	test('should reject with 403 when the origin is foreign', async ({
		assert,
	}) => {
		const status = await requestUpgradeStatus({
			Origin: 'https://evil.example',
		});

		assert.equal(status, FORBIDDEN_STATUS);
	});
});
