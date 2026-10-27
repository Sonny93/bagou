import { column } from '@adonisjs/lucid/orm';

import { UserSettingSchema } from '#database/schema';
import type { DictationLanguage } from '#shared/dictation_language';
import type { InterfaceLanguage } from '#user_settings/interface_language';

export default class UserSetting extends UserSettingSchema {
	declare dictationLanguage: DictationLanguage;
	declare interfaceLanguage: InterfaceLanguage;

	/** Serialized by hand: the pg driver would send a JS array as a Postgres array, not as JSON. */
	@column({
		prepare: (vocabulary: readonly string[]) => JSON.stringify(vocabulary),
	})
	declare vocabulary: string[];
}
