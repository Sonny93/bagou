import { inject } from '@adonisjs/core';

import userSettingsConfig from '#config/user_settings';
import UserSetting from '#user_settings/user_setting';
import type { UserSettings } from '#user_settings/user_settings';

@inject()
export class UserSettingsService {
	/** Falls back to the defaults for a user who never saved any settings. */
	async get(userId: number): Promise<UserSettings> {
		const row = await UserSetting.findBy('userId', userId);
		if (!row) return userSettingsConfig.defaults;
		return {
			dictationLanguage: row.dictationLanguage,
			interfaceLanguage: row.interfaceLanguage,
			vocabulary: row.vocabulary,
			cleanupInstructions: row.cleanupInstructions,
		};
	}

	/** Creates the settings of the user or replaces them; the vocabulary is deduplicated. */
	async update(userId: number, input: Readonly<UserSettings>): Promise<void> {
		await UserSetting.updateOrCreate(
			{ userId },
			{
				dictationLanguage: input.dictationLanguage,
				interfaceLanguage: input.interfaceLanguage,
				vocabulary: [...new Set(input.vocabulary)],
				cleanupInstructions: input.cleanupInstructions,
			}
		);
	}
}
