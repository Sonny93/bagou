import { useCallback } from 'react';

import { DictationDock } from '~/dictation/show_dictation/dictation_dock';
import { DictationHeader } from '~/dictation/show_dictation/dictation_header';
import { DictationStage } from '~/dictation/show_dictation/dictation_stage';
import { useAutoStartPreference } from '~/dictation/show_dictation/use_auto_start_preference';
import { useDictation } from '~/dictation/show_dictation/use_dictation';
import { useDictationDraft } from '~/dictation/show_dictation/use_dictation_draft';
import { useDictationHotkeys } from '~/dictation/show_dictation/use_dictation_hotkeys';
import { useDraftCopy } from '~/dictation/show_dictation/use_draft_copy';
import { useRefreshRemainingQuota } from '~/dictation/show_dictation/use_refresh_remaining_quota';
import { useSaveDraftText } from '~/dictation/show_dictation/use_save_draft_text';

type ShowDictationProps = {
	remainingMinutes: number;
};

export default function ShowDictation({
	remainingMinutes,
}: Readonly<ShowDictationProps>) {
	const [isAutoStartEnabled, setAutoStartEnabled] = useAutoStartPreference();
	const draft = useDictationDraft();
	const { copyStatus, copyDraft } = useDraftCopy({
		draftId: draft.draftId,
		draftText: draft.text,
	});
	const { state, levels, finish, cancel, start } = useDictation({
		shouldAutoStart: isAutoStartEnabled,
		insertSegment: draft.insert,
		replaceDraft: draft.replace,
		getDraftContext: draft.getContext,
		copyDraft,
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
				isAutoStartEnabled={isAutoStartEnabled}
				onAutoStartChange={setAutoStartEnabled}
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
				onCopy={handleCopy}
				onStart={start}
				onStartNew={startNew}
				onFinish={finish}
				onCancel={cancel}
			/>
		</div>
	);
}
