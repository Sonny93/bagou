import vine from '@vinejs/vine';

import userSettingsConfig from '#config/user_settings';

const SIDE_WITHOUT_CONTROL_CHARACTER_OR_ANGLE_BRACKET = /^[^\p{Cc}<>]+$/u;

const sideField = () =>
	vine
		.string()
		.trim()
		.minLength(1)
		.maxLength(userSettingsConfig.maxCorrectionSideLength)
		.regex(SIDE_WITHOUT_CONTROL_CHARACTER_OR_ANGLE_BRACKET);

export const addCorrectionValidator = vine.create({
	heard: sideField(),
	written: sideField().notSameAs('heard'),
});
