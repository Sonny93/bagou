import { Card } from '@minimalstuff/ui';

import { DictationBody } from '~/dictation/show_dictation/dictation_body';
import { DictationHeader } from '~/dictation/show_dictation/dictation_header';
import { DictationHint } from '~/dictation/show_dictation/dictation_hint';
import { useDictation } from '~/dictation/show_dictation/use_dictation';
import { useDictationHotkeys } from '~/dictation/show_dictation/use_dictation_hotkeys';

export default function ShowDictation() {
	const { state, level, finish, cancel, restart } = useDictation();
	useDictationHotkeys({ status: state.status, finish, cancel, restart });

	return (
		<main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 bg-gray-50 p-6 dark:bg-gray-800">
			<DictationHeader />
			<Card title="Dictée" padding="lg" className="flex-1">
				<DictationBody state={state} level={level} />
			</Card>
			<DictationHint status={state.status} onRestart={restart} />
		</main>
	);
}
