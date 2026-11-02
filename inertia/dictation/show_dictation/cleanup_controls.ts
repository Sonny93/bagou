import type { VersionToggle } from '~/dictation/show_dictation/get_version_toggle';
import type {
	CleanupQuality,
	CleanupQualityOption,
} from '~/shared/cleanup_quality';

/** What the cleanup button, its menu and the model label need to know and do. */
export type CleanupControls = {
	qualities: readonly CleanupQualityOption[];
	savedQuality: CleanupQuality;
	shownQuality: CleanupQuality | null;
	versionToggle: VersionToggle | null;
	onClean: () => void;
	onCleanWith: (quality: CleanupQuality) => void;
	onToggleVersion: () => void;
};
