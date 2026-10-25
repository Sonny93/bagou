import app from '@adonisjs/core/services/app';
import { defineConfig, stores } from '@adonisjs/session';

/**
 * Sessions live in Postgres. Tests use the built-in memory store instead:
 * the Japa session and auth api-client plugins simulate session state
 * through the same in-process store the session middleware reads.
 */
const SESSION_STORE = app.inTest ? 'memory' : 'database';

const sessionConfig = defineConfig({
	enabled: true,
	cookieName: 'adonis-session',
	clearWithBrowser: false,
	age: '30d',
	cookie: {
		path: '/',
		httpOnly: true,
		secure: app.inProduction,
		sameSite: 'lax',
	},
	store: SESSION_STORE,
	stores: {
		database: stores.database(),
	},
});

export default sessionConfig;
