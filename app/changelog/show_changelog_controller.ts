import type { HttpContext } from '@adonisjs/core/http';

export default class ShowChangelogController {
	async render({ auth, inertia }: HttpContext) {
		return inertia.render('changelog/show_changelog', {
			previousSeenVersion: auth.getUserOrFail().lastSeenVersion,
		});
	}
}
