import { BaseTransformer } from '@adonisjs/core/transformers';

import type { UserSettings } from '#user_settings/user_settings';

export default class UserSettingsTransformer extends BaseTransformer<UserSettings> {
	toObject() {
		return {
			dictationLanguage: this.resource.dictationLanguage,
			interfaceLanguage: this.resource.interfaceLanguage,
			vocabulary: [...this.resource.vocabulary],
			cleanupInstructions: this.resource.cleanupInstructions,
		};
	}
}
