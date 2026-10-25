import { Card, Kbd } from '@minimalstuff/ui';

import { DictationHeader } from '~/dictation/show_dictation/dictation_header';

export default function ShowDictation() {
	return (
		<main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 bg-gray-50 p-6 dark:bg-gray-800">
			<DictationHeader />
			<Card title="Dictée" padding="lg" className="flex-1">
				<p className="min-h-64 text-2xl leading-relaxed" aria-live="polite" />
			</Card>
			<p className="text-sm text-gray-600 dark:text-gray-300">
				Appuie sur <Kbd>Entrée</Kbd> pour terminer, <Kbd>Échap</Kbd> pour
				annuler
			</p>
		</main>
	);
}
