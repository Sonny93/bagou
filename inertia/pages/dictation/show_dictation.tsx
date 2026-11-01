import { useCallback, useMemo } from 'react';

import { createAutoCopy } from '~/dictation/show_dictation/auto_copy';
import { DictationDock } from '~/dictation/show_dictation/dictation_dock';
import { DictationHeader } from '~/dictation/show_dictation/dictation_header';
import { DictationStage } from '~/dictation/show_dictation/dictation_stage';
import { useDictation } from '~/dictation/show_dictation/use_dictation';
import { useDictationDraft } from '~/dictation/show_dictation/use_dictation_draft';
import {
	NEW_DICTATION_STATUSES,
	useDictationHotkeys,
} from '~/dictation/show_dictation/use_dictation_hotkeys';
import { useDraftCopy } from '~/dictation/show_dictation/use_draft_copy';
import { useRefreshRemainingQuota } from '~/dictation/show_dictation/use_refresh_remaining_quota';
import { useSaveDraftText } from '~/dictation/show_dictation/use_save_draft_text';
import { readBooleanPreference } from '~/shared/preferences/boolean_preference';
import {
	AUTO_COPY_PREFERENCE,
	AUTO_START_PREFERENCE,
} from '~/shared/preferences/dictation_preferences';
import { useBooleanPreference } from '~/shared/preferences/use_boolean_preference';

type ShowDictationProps = {
	remainingMinutes: number;
};

export default function ShowDictation({
	remainingMinutes,
}: Readonly<ShowDictationProps>) {
	const [isAutoStartEnabled] = useBooleanPreference(AUTO_START_PREFERENCE);
	const draft = useDictationDraft();
	const { copyStatus, copyCount, copyDraft } = useDraftCopy({
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
	const { state, levels, finish, cancel, start, cleanDraft } = useDictation({
		shouldAutoStart: isAutoStartEnabled,
		insertSegment: draft.insert,
		replaceDraft: draft.replace,
		getDraftContext: draft.getContext,
		copyDraft: copyAutomatically,
		draftId: draft.draftId,
		draftText: draft.text,
	});
	useSaveDraftText({
		draftId: draft.draftId,
		text: draft.text,
		cleanedText: draft.cleanedText,
		status: state.status,
	});
	const { clear: clearDraft } = draft;
	const startNew = useCallback(() => {
		clearDraft();
		start();
	}, [clearDraft, start]);
	const hasDraftText = draft.text.trim() !== '';
	const handleCopy = useCallback(
		() => void copyDraft(draft.text),
		[copyDraft, draft.text]
	);
	useDictationHotkeys({
		status: state.status,
		start,
		startNew,
		finish,
		cancel,
		copy: handleCopy,
		canCopy: hasDraftText,
	});
	useRefreshRemainingQuota(state.status);

	return (
		<div className="flex h-dvh flex-col">
			<DictationHeader
				isNewDictationAvailable={NEW_DICTATION_STATUSES.has(state.status)}
				onStartNew={startNew}
			/>
			<DictationStage
				state={state}
				draft={{
					text: draft.text,
					selection: draft.selection,
					onTextChange: draft.edit,
					onSelectionChange: draft.select,
				}}
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
				onCleanDraft={cleanDraft}
			/>
		</div>
	);
}
