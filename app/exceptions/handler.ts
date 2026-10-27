import { ExceptionHandler, type HttpContext } from '@adonisjs/core/http';
import app from '@adonisjs/core/services/app';
import type { HttpError } from '@adonisjs/core/types/http';

const SERVER_ERROR_STATUS = 500;
const INTERNAL_SERVER_ERROR_CODE = 'E_INTERNAL_SERVER_ERROR';
const INTERNAL_SERVER_ERROR_MESSAGE = 'Internal server error';

export default class HttpExceptionHandler extends ExceptionHandler {
	/**
	 * In debug mode, the exception handler will display verbose errors
	 * with pretty printed stack traces.
	 */
	protected debug = !app.inProduction;

	/**
	 * The method is used for handling errors and returning
	 * response to the client
	 */
	async handle(error: unknown, ctx: HttpContext) {
		return super.handle(error, ctx);
	}

	/**
	 * Every error response carries the stable `code` next to the developer
	 * message, so clients translate by code. Never a stack trace, even in debug,
	 * and never the message of a server error: it may come from a driver and
	 * carry data.
	 */
	override async renderErrorAsJSON(
		error: HttpError,
		ctx: HttpContext
	): Promise<void> {
		if (error.status >= SERVER_ERROR_STATUS) {
			ctx.response.status(error.status).send({
				code: error.code ?? INTERNAL_SERVER_ERROR_CODE,
				message: INTERNAL_SERVER_ERROR_MESSAGE,
			});
			return;
		}
		ctx.response
			.status(error.status)
			.send({ code: error.code, message: error.message });
	}

	/**
	 * The method is used to report error to the logging service or
	 * the a third party error monitoring service.
	 *
	 * @note You should not attempt to send a response from this method.
	 */
	async report(error: unknown, ctx: HttpContext) {
		return super.report(error, ctx);
	}
}
