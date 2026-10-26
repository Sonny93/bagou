import { Kbd } from '@minimalstuff/ui';
import { useEffect, useRef } from 'react';

import { cn } from '~/shared/lib/cn';
import { FOCUS_RING_CLASSES } from '~/shared/ui/focus_ring_classes';

type IdleStageProps = {
	onStart: () => void;
};

export function IdleStage({ onStart }: Readonly<IdleStageProps>) {
	const buttonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		buttonRef.current?.focus();
	}, []);

	return (
		<div className="my-auto flex flex-col items-center gap-5">
			<button
				ref={buttonRef}
				type="button"
				aria-label="Démarrer la dictée"
				onClick={onStart}
				className={cn(
					'flex size-28 cursor-pointer items-center justify-center rounded-full bg-accent-600 text-white transition-colors hover:bg-accent-700 dark:bg-accent-400 dark:text-canvas dark:hover:bg-accent-300',
					FOCUS_RING_CLASSES,
					'focus-visible:outline-offset-4'
				)}
			>
				<span className="i-tabler-microphone size-12" aria-hidden />
			</button>
			<p className="text-sm text-muted">
				Appuie sur <Kbd>Entrée</Kbd> pour dicter
			</p>
		</div>
	);
}
