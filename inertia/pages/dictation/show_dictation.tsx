import type { Data } from '@generated/data';
import { useLingui } from '@lingui/react/macro';
import { useCallback, useMemo } from 'react';

import { CorrectionReview } from '~/correction_suggestions/show_dictation/correction_review';
import { useCorrectionReview } from '~/correction_suggestions/show_dictation/use_correction_review';
import { CLEANABLE_STATUSES } from '~/dictation/core/dictation_state';
import { createAutoCopy } from '~/dictation/show_dictation/auto_copy';
import { canStartNewDictation } from '~/dictation/show_dictation/can_start_new_dictation';
import { DictationDock } from '~/dictation/show_dictation/dictation_dock';
import { DictationHeader } from '~/dictation/show_dictation/dictation_header';
import { DictationStage } from '~/dictation/show_dictation/dictation_stage';
import { getLeaveRisk } from '~/dictation/show_dictation/get_leave_risk';
import { useCleanupControls } from '~/dictation/show_dictation/use_cleanup_controls';
import { useDetectEditedCorrections } from '~/dictation/show_dictation/use_detect_edited_corrections';
import { useDictation } from '~/dictation/show_dictation/use_dictation';
import { useDictationDraft } from '~/dictation/show_dictation/use_dictation_draft';
import { useDictationHotkeys } from '~/dictation/show_dictation/use_dictation_hotkeys';
import { useDraftCopy } from '~/dictation/show_dictation/use_draft_copy';
import { useRefreshRemainingQuota } from '~/dictation/show_dictation/use_refresh_remaining_quota';
import { useRequestNewDictation } from '~/dictation/show_dictation/use_request_new_dictation';
import { useSaveDraftText } from '~/dictation/show_dictation/use_save_draft_text';
import type {
	CleanupQuality,
	CleanupQualityOption,
} from '~/shared/cleanup_quality';
import { useLeaveConfirmation } from '~/shared/navigation/use_leave_confirmation';
import { readBooleanPreference } from '~/shared/preferences/boolean_preference';
import {
	AUTO_COPY_PREFERENCE,
	AUTO_START_PREFERENCE,
} from '~/shared/preferences/dictation_preferences';
import { useBooleanPreference } from '~/shared/preferences/use_boolean_preference';

type ShowDictationProps = {
	remainingMinutes: number;
	cleanupQualities: CleanupQualityOption[];
	cleanupQuality: CleanupQuality;
	corrections: Data.Corrections.Correction[];
	pendingSuggestions: Data.CorrectionSuggestions.CorrectionSuggestion[];
	dismissedSuggestions: { heard: string; written: string }[];
};

export default function ShowDictation({
	remainingMinutes,
	cleanupQualities,
	cleanupQuality,
	corrections,
	pendingSuggestions,
	dismissedSuggestions,
}: Readonly<ShowDictationProps>) {
	const { t } = useLingui();
	const [isAutoStartEnabled] = useBooleanPreference(AUTO_START_PREFERENCE);
	const draft = useDictationDraft();
	const { suggestions, reviewItems, resolve } = useCorrectionReview({
		corrections,
		dismissedSuggestions,
		pendingSuggestions,
		draft,
	});
	const { copyStatus, copyCount, copyDraft, recordSelectionCopy } =
		useDraftCopy({
			draftId: draft.draftId,
			draftText: draft.text,
		});
	const copyAutomatically = useMemo(
		() =>
			createAutoCopy(copyDraft, () =>
				readBooleanPreference(AUTO_COPY_PREFERENCE)
			),
		[copyDraft]
	);
	const {
		state,
		levels,
		finish,
		cancel,
		start,
		reset,
		cleanDraft,
		cleanDraftWith,
		cleanupSnapshot,
	} = useDictation({
		shouldAutoStart: isAutoStartEnabled,
		insertSegment: suggestions.insert,
		replaceDraft: suggestions.replace,
		getDraftContext: draft.getContext,
		copyDraft: copyAutomatically,
		draftId: draft.draftId,
		draftText: draft.text,
		savedQuality: cleanupQuality,
	});
	const cleanupControls = useCleanupControls({
		draftId: draft.draftId,
		draftText: draft.text,
		editDraft: draft.edit,
		rebaseCorrections: suggestions.rebase,
		snapshot: cleanupSnapshot,
		qualities: cleanupQualities,
		savedQuality: cleanupQuality,
		cleanDraft,
		cleanDraftWith,
	});
	const { saveStatus, explicitSave, saveNow } = useSaveDraftText({
		draftId: draft.draftId,
		text: draft.text,
		cleanedText: draft.cleanedText,
		status: state.status,
	});
	const leaveRisk = getLeaveRisk(state.status, saveStatus);
	useLeaveConfirmation({
		isBlocking: leaveRisk !== null,
		title: t`Leave this page?`,
		message:
			leaveRisk === 'dictation-in-progress'
				? t`A dictation is in progress. If you leave now, it will be lost.`
				: t`Your text is not saved in the history yet. If you leave now, it may be lost.`,
		confirmLabel: t`Leave`,
	});
	const { clear: clearDraft } = suggestions;
	const startOver = useCallback(() => {
		clearDraft();
		reset();
	}, [clearDraft, reset]);
	const requestNewDictation = useRequestNewDictation({
		saveStatus,
		startNew: startOver,
	});
	const hasDraftText = draft.text.trim() !== '';
	const canStartNew = canStartNewDictation(state.status, draft.text);
	const handleCopy = useCallback(
		() => void copyDraft(draft.text),
		[copyDraft, draft.text]
	);
	useDictationHotkeys({
		status: state.status,
		start,
		startNew: requestNewDictation,
		canStartNew,
		finish,
		cancel,
		copy: handleCopy,
		canCopy: hasDraftText,
		save: saveNow,
	});
	useRefreshRemainingQuota(state.status);
	useDetectEditedCorrections({
		text: draft.text,
		status: state.status,
		detectEdits: suggestions.detectEdits,
	});

	return (
		<div className="flex h-dvh flex-col">
			<DictationHeader
				isNewDictationAvailable={canStartNew}
				onStartNew={requestNewDictation}
				saveStatus={saveStatus}
				explicitSave={explicitSave}
			/>
			<DictationStage
				state={state}
				draft={{
					text: draft.text,
					selection: draft.selection,
					onTextChange: draft.edit,
					onSelectionChange: draft.select,
					onCopy: recordSelectionCopy,
				}}
			/>
			<CorrectionReview
				items={reviewItems}
				canReview={CLEANABLE_STATUSES.has(state.status)}
				onResolved={resolve}
			/>
			<DictationDock
				state={state}
				levels={levels}
				remainingMinutes={remainingMinutes}
				hasDraftText={hasDraftText}
				copyStatus={copyStatus}
				copyCount={copyCount}
				onCopy={handleCopy}
				onStart={start}
				onFinish={finish}
				onCancel={cancel}
				cleanup={cleanupControls}
			/>
		</div>
	);
}
