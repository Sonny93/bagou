import { Kbd, Tooltip } from '@minimalstuff/ui';
import { useEffect, useRef } from 'react';

import { cn } from '~/shared/lib/cn';
import { FOCUS_RING_CLASSES } from '~/shared/ui/focus_ring_classes';

type MicButtonProps = {
	isRecording: boolean;
	isBusy: boolean;
	hasDraftText: boolean;
	onStart: () => void;
	onFinish: () => void;
};

const BUTTON_CLASSES =
	'flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full bg-accent-600 text-white transition-colors hover:bg-accent-700 disabled:cursor-default disabled:opacity-60 dark:bg-accent-400 dark:text-canvas dark:hover:bg-accent-300';

const getIcon = (isRecording: boolean, isBusy: boolean): string => {
	if (isBusy) {
		return 'i-tabler-loader-2 animate-spin motion-reduce:animate-none';
	}
	return isRecording ? 'i-tabler-player-stop-filled' : 'i-tabler-microphone';
};

const getLabel = (isRecording: boolean, hasDraftText: boolean): string => {
	if (isRecording) return 'Terminer la dictée';
	return hasDraftText ? 'Continuer la dictée' : 'Démarrer la dictée';
};

/** The one dictation toggle: starts a segment, finishes it, or waits while busy. */
export function MicButton({
	isRecording,
	isBusy,
	hasDraftText,
	onStart,
	onFinish,
}: Readonly<MicButtonProps>) {
	const buttonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		buttonRef.current?.focus();
	}, []);

	const label = getLabel(isRecording, hasDraftText);
	const handleClick = isRecording ? onFinish : onStart;

	return (
		<Tooltip
			position="top"
			disabled={isBusy}
			content={
				<>
					{label} <Kbd>Entrée</Kbd>
				</>
			}
		>
			<button
				ref={buttonRef}
				type="button"
				aria-label={label}
				aria-busy={isBusy}
				disabled={isBusy}
				onClick={handleClick}
				className={cn(BUTTON_CLASSES, FOCUS_RING_CLASSES)}
			>
				<span
					className={cn(getIcon(isRecording, isBusy), 'size-6')}
					aria-hidden
				/>
			</button>
		</Tooltip>
	);
}
