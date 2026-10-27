import { toast } from 'sonner';

import { logError } from './log_error';

type ReportErrorOptions = {
	toastId?: string;
};

/**
 * Logs the error and tells the user with a toast. Give a `toastId` to a
 * failure that can repeat so that it shows once instead of piling up.
 */
export function reportError(
	message: string,
	error: unknown,
	options: Readonly<ReportErrorOptions> = {}
): void {
	logError(message, error);
	toast.error(message, { id: options.toastId });
}
