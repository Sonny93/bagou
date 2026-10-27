import vine from '@vinejs/vine';

import userSettingsConfig from '#config/user_settings';

/**
 * Nullable because the body parser turns an empty string into `null`.
 */
export const cleanupInstructionsField = () =>
	vine
		.string()
		.trim()
		.maxLength(userSettingsConfig.maxInstructionsLength)
		.nullable();
