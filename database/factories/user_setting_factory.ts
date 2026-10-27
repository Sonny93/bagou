import Factory from '@adonisjs/lucid/factories';

import userSettingsConfig from '#config/user_settings';
import UserSetting from '#user_settings/user_setting';

export const UserSettingFactory = Factory.define(UserSetting, () => ({
	dictationLanguage: userSettingsConfig.defaults.dictationLanguage,
	interfaceLanguage: userSettingsConfig.defaults.interfaceLanguage,
	vocabulary: [],
	cleanupInstructions: userSettingsConfig.defaults.cleanupInstructions,
})).build();
