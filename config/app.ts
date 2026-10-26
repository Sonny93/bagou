import { defineConfig } from '@adonisjs/core/http';
import app from '@adonisjs/core/services/app';
import proxyAddr from 'proxy-addr';

/**
 * The configuration settings used by the HTTP server
 */
export const http = defineConfig({
	generateRequestId: true,
	allowMethodSpoofing: false,

	/**
	 * Behind the reverse proxy on a private docker network, so the client IP
	 * (the key of the auth rate limit) is read from the forwarded header.
	 */
	trustProxy: proxyAddr.compile(['loopback', 'uniquelocal']),

	/**
	 * Enabling async local storage will let you access HTTP context
	 * from anywhere inside your application.
	 */
	useAsyncLocalStorage: false,

	/**
	 * Manage cookies configuration. The settings for the session id cookie are
	 * defined inside the "config/session.ts" file.
	 */
	cookie: {
		domain: '',
		path: '/',
		maxAge: '2h',
		httpOnly: true,
		secure: app.inProduction,
		sameSite: 'lax',
	},
});
