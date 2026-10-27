import type { HttpContext } from '@adonisjs/core/http';
import type { NextFn } from '@adonisjs/core/types/http';
import BaseInertiaMiddleware from '@adonisjs/inertia/inertia_middleware';
import type { InferSharedProps } from '@adonisjs/inertia/types';

import type { InterfaceLanguage } from '#user_settings/interface_language';
import { UserSettingsService } from '#user_settings/user_settings_service';

export default class InertiaMiddleware extends BaseInertiaMiddleware {
	async share(ctx: HttpContext) {
		return {
			errors: ctx.inertia.always(this.getValidationErrors(ctx)),
			interfaceLanguage: await this.#readInterfaceLanguage(ctx),
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
