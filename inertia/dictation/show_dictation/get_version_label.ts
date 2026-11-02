import type { VersionToggle } from '~/dictation/show_dictation/get_version_toggle';
import type {
	CleanupQuality,
	CleanupQualityOption,
} from '~/shared/cleanup_quality';

export type VersionLabel =
	| { kind: 'cleaned'; modelName: string }
	| { kind: 'original' };

/**
 * Which version of a re-cleaned text is shown: the cleaned one, named after
 * its model, or the one before cleanup; none when the text is neither.
 */
export function getVersionLabel(
	qualities: readonly CleanupQualityOption[],
	shownQuality: CleanupQuality | null,
	versionToggle: VersionToggle | null
): VersionLabel | null {
	const modelName = qualities.find(
		({ value }) => value === shownQuality
	)?.modelName;
	if (modelName !== undefined) return { kind: 'cleaned', modelName };
	return versionToggle === 'show-cleaned' ? { kind: 'original' } : null;
}
