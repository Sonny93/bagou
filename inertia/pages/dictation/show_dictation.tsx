import { DictationDock } from '~/dictation/show_dictation/dictation_dock';
import { DictationHeader } from '~/dictation/show_dictation/dictation_header';
import { DictationStage } from '~/dictation/show_dictation/dictation_stage';
import { useAutoStartPreference } from '~/dictation/show_dictation/use_auto_start_preference';
import { useDictation } from '~/dictation/show_dictation/use_dictation';
import { useDictationHotkeys } from '~/dictation/show_dictation/use_dictation_hotkeys';
import { useEditedText } from '~/dictation/show_dictation/use_edited_text';
import { useRefreshRemainingQuota } from '~/dictation/show_dictation/use_refresh_remaining_quota';

type ShowDictationProps = {
	remainingMinutes: number;
};

export default function ShowDictation({
	remainingMinutes,
}: Readonly<ShowDictationProps>) {
	const [isAutoStartEnabled, setAutoStartEnabled] = useAutoStartPreference();
	const { state, levels, copyStatus, copyText, finish, cancel, start } =
		useDictation({
			shouldAutoStart: isAutoStartEnabled,
		});
	const [editedText, setEditedText] = useEditedText(
		state.status === 'done' ? state.text : ''
	);
	useDictationHotkeys({ status: state.status, finish, cancel, start });
	useRefreshRemainingQuota(state.status);

	const handleCopy = () => copyText(editedText);

	return (
		<div className="flex h-dvh flex-col">
			<DictationHeader
				isAutoStartEnabled={isAutoStartEnabled}
				onAutoStartChange={setAutoStartEnabled}
			/>
			<DictationStage
				state={state}
				editedText={editedText}
				onEditedTextChange={setEditedText}
				onStart={start}
			/>
			<DictationDock
				state={state}
				levels={levels}
				remainingMinutes={remainingMinutes}
				copyStatus={copyStatus}
				onCopy={handleCopy}
				onStart={start}
				onFinish={finish}
				onCancel={cancel}
			/>
		</div>
	);
}
