import { useCallback } from 'react';

import { DictationDock } from '~/dictation/show_dictation/dictation_dock';
import { DictationHeader } from '~/dictation/show_dictation/dictation_header';
import { DictationStage } from '~/dictation/show_dictation/dictation_stage';
import { useAutoStartPreference } from '~/dictation/show_dictation/use_auto_start_preference';
import { useDictation } from '~/dictation/show_dictation/use_dictation';
import { useDictationDraft } from '~/dictation/show_dictation/use_dictation_draft';
import { useDictationHotkeys } from '~/dictation/show_dictation/use_dictation_hotkeys';
import { useRefreshRemainingQuota } from '~/dictation/show_dictation/use_refresh_remaining_quota';

type ShowDictationProps = {
	remainingMinutes: number;
};

export default function ShowDictation({
	remainingMinutes,
}: Readonly<ShowDictationProps>) {
	const [isAutoStartEnabled, setAutoStartEnabled] = useAutoStartPreference();
	const draft = useDictationDraft();
	const { state, levels, copyStatus, copyText, finish, cancel, start } =
		useDictation({
			shouldAutoStart: isAutoStartEnabled,
			insertSegment: draft.insert,
		});
	const { clear: clearDraft } = draft;
	const startNew = useCallback(() => {
		clearDraft();
		start();
	}, [clearDraft, start]);
	useDictationHotkeys({
		status: state.status,
		start,
		startNew,
		finish,
		cancel,
	});
	useRefreshRemainingQuota(state.status);

	const handleCopy = () => copyText(draft.text);

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
				hasDraftText={draft.text.trim() !== ''}
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
