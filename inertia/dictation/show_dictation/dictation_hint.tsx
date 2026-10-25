import { Button, Kbd } from '@minimalstuff/ui';

import type { DictationState } from '~/dictation/core/dictation_state';

type DictationHintProps = {
	status: DictationState['status'];
	onRestart: () => void;
};

const ENDED_STATUSES = new Set<DictationState['status']>([
	'done',
	'cancelled',
	'error',
]);

export const DictationHint = ({
	status,
	onRestart,
}: Readonly<DictationHintProps>) => {
	if (ENDED_STATUSES.has(status)) {
		return (
			<div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
				<Button onClick={onRestart}>Nouvelle dictée</Button>
				<span>
					ou appuie sur <Kbd>N</Kbd>
				</span>
			</div>
		);
	}

	return (
		<p className="text-sm text-gray-600 dark:text-gray-300">
			Appuie sur <Kbd>Entrée</Kbd> pour terminer, <Kbd>Échap</Kbd> pour annuler
		</p>
	);
};
