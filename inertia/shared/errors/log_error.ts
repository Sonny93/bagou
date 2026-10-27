/** Makes an error visible in the devtools console, with what was being done. */
export function logError(context: string, error: unknown): void {
	console.error(context, error);
}
