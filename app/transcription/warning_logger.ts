/**
 * The only logging capability the adapters need, satisfied by Adonis' Logger.
 * Fields carry codes and counts only, never transcript text or secrets.
 */
export type WarningLogger = {
	warn(fields: Record<string, unknown>, message: string): void;
};
