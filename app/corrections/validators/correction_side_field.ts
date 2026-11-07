import vine from '@vinejs/vine';

import userSettingsConfig from '#config/user_settings';

const SIDE_WITHOUT_CONTROL_CHARACTER_OR_ANGLE_BRACKET = /^[^\p{Cc}<>]+$/u;

export const correctionSideField = () =>
	vine
		.string()
		.trim()
		.minLength(1)
		.maxLength(userSettingsConfig.maxCorrectionSideLength)
		.regex(SIDE_WITHOUT_CONTROL_CHARACTER_OR_ANGLE_BRACKET);
