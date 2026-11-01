import type { BooleanPreference } from './boolean_preference';

export const AUTO_START_PREFERENCE: BooleanPreference = {
	storageKey: 'bagou:dictation:auto-start',
	defaultValue: false,
};

export const AUTO_COPY_PREFERENCE: BooleanPreference = {
	storageKey: 'bagou:dictation:auto-copy',
	defaultValue: true,
};
