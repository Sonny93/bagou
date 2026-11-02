import type { DraftSelection } from '~/dictation/core/dictation_draft';
import type { CleanupControls } from '~/dictation/show_dictation/cleanup_controls';
import type { CleanupSnapshot } from '~/dictation/show_dictation/cleanup_snapshot';
import { getVersionToggle } from '~/dictation/show_dictation/get_version_toggle';
import type {
	CleanupQuality,
	CleanupQualityOption,
} from '~/shared/cleanup_quality';

type UseCleanupControlsOptions = {
	draftId: string;
	draftText: string;
	editDraft: (text: string, selection: DraftSelection) => void;
	snapshot: CleanupSnapshot | null;
	qualities: readonly CleanupQualityOption[];
	savedQuality: CleanupQuality;
	cleanDraft: () => void;
	cleanDraftWith: (quality: CleanupQuality) => void;
};

/**
 * Gathers what the cleanup button and its menu need. The version toggle puts
 * the other version back as a hand edit, not as a server-cleaned text, so the
 * draft is saved to the history like any edit.
 */
export function useCleanupControls({
	draftId,
	draftText,
	editDraft,
	snapshot,
	qualities,
	savedQuality,
	cleanDraft,
	cleanDraftWith,
}: Readonly<UseCleanupControlsOptions>): CleanupControls {
	const versionToggle = getVersionToggle(snapshot, draftId, draftText);
	const isShowingCleaned =
		snapshot?.draftId === draftId && draftText === snapshot.cleanedText;

	const toggleVersion = () => {
		if (snapshot === null || versionToggle === null) return;
		const text =
			versionToggle === 'show-original'
				? snapshot.originalText
				: snapshot.cleanedText;
		editDraft(text, { start: text.length, end: text.length });
	};

	return {
		qualities,
		savedQuality,
		shownQuality: isShowingCleaned ? snapshot.quality : null,
		versionToggle,
		onClean: cleanDraft,
		onCleanWith: cleanDraftWith,
		onToggleVersion: toggleVersion,
	};
}
