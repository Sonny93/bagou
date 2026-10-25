import type { HttpContext } from '@adonisjs/core/http';

export default class ShowLoginController {
	async render({ inertia }: HttpContext) {
		return inertia.render('passkeys/show_login', {});
	}
}
