import type { HttpContext } from '@adonisjs/core/http';

import { buildManifest, MANIFEST_LANGUAGES } from '#pwa/build_manifest';

const MANIFEST_CONTENT_TYPE = 'application/manifest+json';
const FALLBACK_LANGUAGE = 'en';

export default class ShowManifestController {
	async render({ request, response }: HttpContext) {
		const negotiatedLanguage = request.language([...MANIFEST_LANGUAGES]);
		const language =
			MANIFEST_LANGUAGES.find(
				(candidate) => candidate === negotiatedLanguage
			) ?? FALLBACK_LANGUAGE;
		response.header('Content-Type', MANIFEST_CONTENT_TYPE);
		response.header('Vary', 'Accept-Language');
		return response.send(JSON.stringify(buildManifest(language)));
	}
}
