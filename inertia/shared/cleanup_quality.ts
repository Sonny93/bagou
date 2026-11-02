import type { Data } from '@generated/data';

export type CleanupQuality = Data.UserSettings['cleanupQuality'];

export type CleanupQualityOption = {
	value: CleanupQuality;
	modelName: string;
};
