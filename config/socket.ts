import { authenticateWithAdonisAuth, defineConfig } from '@rlanz/socket';

import env from '#start/env';
import type User from '#users/user';

const MAX_INBOUND_PAYLOAD_BYTES = 64 * 1024;
const PING_INTERVAL = '25s';
const PING_TIMEOUT = '5s';
const ALLOWED_ORIGIN = new URL(env.get('APP_URL')).origin;

/**
 * The upgrade request goes through session and auth like any page request, so
 * a missing or expired session cookie is rejected with 401 before any channel
 * is reachable.
 *
 * Only the origin of APP_URL may open a socket: proxies do not reliably
 * forward the scheme, so the library default (derived from X-Forwarded-Proto)
 * rejects the browser origin behind Cloudflare or Traefik.
 *
 * A socket carries at most one dictation channel at a time, which enforces
 * "one active dictation per socket". Raise it when another channel is added.
 */
export default defineConfig({
	websocket: {
		middleware: [
			() => import('@adonisjs/session/session_middleware'),
			() => import('@adonisjs/auth/initialize_auth_middleware'),
		],
		authenticate: authenticateWithAdonisAuth<User>(),
		origin: [ALLOWED_ORIGIN],
		maxPayload: MAX_INBOUND_PAYLOAD_BYTES,
		maxSubscriptionsPerSocket: 1,
		pingInterval: PING_INTERVAL,
		pingTimeout: PING_TIMEOUT,
	},
});
