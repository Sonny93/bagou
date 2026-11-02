import { useRequestFailureToasts } from '~/shared/errors/use_request_failure_toasts';
import { useUnhandledErrorToasts } from '~/shared/errors/use_unhandled_error_toasts';

/** Mounts the toasts of failed requests and uncaught errors; renders nothing. */
export function ErrorToasts() {
	useRequestFailureToasts();
	useUnhandledErrorToasts();
	return null;
}
