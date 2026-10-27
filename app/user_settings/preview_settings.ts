import type { UserSettings } from '#user_settings/user_settings';

/** The settings a preview tries on the fly: never read from nor written to the database. */
export type PreviewSettings = Pick<
	UserSettings,
	'dictationLanguage' | 'vocabulary' | 'cleanupInstructions'
>;
