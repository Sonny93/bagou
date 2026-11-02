import type { BooleanPreference } from '~/shared/preferences/boolean_preference';

export const AUTO_START_PREFERENCE: BooleanPreference = {
	storageKey: 'bagou:dictation:auto-start',
	defaultValue: false,
};

export const AUTO_COPY_PREFERENCE: BooleanPreference = {
	storageKey: 'bagou:dictation:auto-copy',
	defaultValue: true,
};
