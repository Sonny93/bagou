import env from '#start/env';

const XSRF_COOKIE_NAME = 'XSRF-TOKEN';

export type BrowserResponse = {
	status: number;
	location: string | null;
	body: unknown;
};

const readBody = async (response: Response): Promise<unknown> => {
	const text = await response.text();
	const isJson = response.headers.get('content-type')?.includes('json');
	return isJson ? JSON.parse(text) : text;
};

/**
 * Behaves like a browser tab talking to the real HTTP server of the test
 * run: it keeps cookies between requests and sends the XSRF token header, so
 * state stored in the session by one request is seen by the next one.
 *
 * The Japa session client cannot be used for this: it destroys the session
 * after every request.
 */
export class BrowserSession {
	private readonly cookies = new Map<string, string>();
	private readonly baseUrl = `http://${env.get('HOST')}:${env.get('PORT')}`;

	get(path: string): Promise<BrowserResponse> {
		return this.send(path, { method: 'GET' });
	}

	post(path: string): Promise<BrowserResponse> {
		return this.send(path, { method: 'POST' });
	}

	postJson(path: string, body?: object): Promise<BrowserResponse> {
		return this.send(path, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(body ?? {}),
		});
	}

	private async send(
		path: string,
		init: Readonly<RequestInit>
	): Promise<BrowserResponse> {
		const response = await fetch(`${this.baseUrl}${path}`, {
			...init,
			redirect: 'manual',
			headers: { accept: 'application/json', ...this.buildHeaders(init) },
		});
		this.absorbCookies(response);
		return {
			status: response.status,
			location: response.headers.get('location'),
			body: await readBody(response),
		};
	}

	private buildHeaders(init: Readonly<RequestInit>): Record<string, string> {
		const headers: Record<string, string> = {
			...(init.headers as Record<string, string> | undefined),
			cookie: [...this.cookies]
				.map(([name, value]) => `${name}=${value}`)
				.join('; '),
		};
		const xsrfToken = this.cookies.get(XSRF_COOKIE_NAME);
		if (xsrfToken) headers['x-xsrf-token'] = decodeURIComponent(xsrfToken);
		return headers;
	}

	private absorbCookies(response: Response): void {
		for (const setCookie of response.headers.getSetCookie()) {
			const [pair] = setCookie.split(';');
			const separatorIndex = pair.indexOf('=');
			const name = pair.slice(0, separatorIndex);
			const value = pair.slice(separatorIndex + 1);
			if (value === '') this.cookies.delete(name);
			else this.cookies.set(name, value);
		}
	}
}
