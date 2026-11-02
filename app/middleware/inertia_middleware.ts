import type { HttpContext } from '@adonisjs/core/http';
import type { NextFn } from '@adonisjs/core/types/http';
import BaseInertiaMiddleware from '@adonisjs/inertia/inertia_middleware';
import type { InferSharedProps } from '@adonisjs/inertia/types';

import type { WhatsNew } from '#changelog/whats_new';
import { WhatsNewService } from '#changelog/whats_new_service';
import type { InterfaceLanguage } from '#user_settings/interface_language';
import { UserSettingsService } from '#user_settings/user_settings_service';

export default class InertiaMiddleware extends BaseInertiaMiddleware {
	async share(ctx: HttpContext) {
		return {
			errors: ctx.inertia.always(this.getValidationErrors(ctx)),
			interfaceLanguage: await this.#readInterfaceLanguage(ctx),
			whatsNew: await this.#readWhatsNew(ctx),
		};
	}

	/**
	 * Runs at render time, after the auth initialization: a silent check, so a
	 * guest gets `null` instead of a redirect.
	 */
	async #readInterfaceLanguage(
		ctx: HttpContext
	): Promise<InterfaceLanguage | null> {
		if (!(await ctx.auth.check())) return null;
		const userSettingsService =
			await ctx.containerResolver.make(UserSettingsService);
		const settings = await userSettingsService.get(ctx.auth.getUserOrFail().id);
		return settings.interfaceLanguage;
	}

	/**
	 * Reads the already-loaded user and the app version only: a guest gets
	 * `null`, and nothing here can fail on the changelog.
	 */
	async #readWhatsNew(ctx: HttpContext): Promise<WhatsNew | null> {
		if (!(await ctx.auth.check())) return null;
		const whatsNewService = await ctx.containerResolver.make(WhatsNewService);
		return whatsNewService.describe(ctx.auth.getUserOrFail().lastSeenVersion);
	}

	async handle(ctx: HttpContext, next: NextFn) {
		await this.init(ctx);
		const output = await next();
		this.dispose(ctx);
		return output;
	}
}

export type InertiaMiddlewareSharedProps = InferSharedProps<InertiaMiddleware>;

declare module '@adonisjs/inertia/types' {
	export interface SharedProps extends InertiaMiddlewareSharedProps {}
}
