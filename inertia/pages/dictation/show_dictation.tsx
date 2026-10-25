import { Card } from '@minimalstuff/ui';

import { DictationBody } from '~/dictation/show_dictation/dictation_body';
import { DictationHeader } from '~/dictation/show_dictation/dictation_header';
import { DictationHint } from '~/dictation/show_dictation/dictation_hint';
import { useAutoStartPreference } from '~/dictation/show_dictation/use_auto_start_preference';
import { useDictation } from '~/dictation/show_dictation/use_dictation';
import { useDictationHotkeys } from '~/dictation/show_dictation/use_dictation_hotkeys';

export default function ShowDictation() {
	const [isAutoStartEnabled, setAutoStartEnabled] = useAutoStartPreference();
	const { state, level, finish, cancel, start } = useDictation({
		shouldAutoStart: isAutoStartEnabled,
	});
	useDictationHotkeys({ status: state.status, finish, cancel, start });

	return (
		<main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 bg-gray-50 p-6 dark:bg-gray-800">
			<DictationHeader
				isAutoStartEnabled={isAutoStartEnabled}
				onAutoStartChange={setAutoStartEnabled}
			/>
			<Card title="Dictée" padding="lg" className="flex-1">
				<DictationBody state={state} level={level} onStart={start} />
			</Card>
			<DictationHint status={state.status} onStart={start} />
		</main>
	);
}
