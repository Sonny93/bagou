import {
	CLEANUP_QUALITIES,
	type CleanupQuality,
} from '#text_cleanup/cleanup_quality';

export type CleanupQualityOption = {
	value: CleanupQuality;
	modelName: string;
};

/** One option per cleanup quality, with the display name of the model behind it. */
export function toCleanupQualityOptions(
	modelNames: Readonly<Record<CleanupQuality, string>>
): CleanupQualityOption[] {
	return CLEANUP_QUALITIES.map((value) => ({
		value,
		modelName: modelNames[value],
	}));
}
