import type { I18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { Trans, useLingui } from '@lingui/react/macro';
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

const getLabel = (
	isRecording: boolean,
	hasDraftText: boolean,
	i18n: I18n
): string => {
	if (isRecording) return i18n._(msg`Finish the dictation`);
	return hasDraftText
		? i18n._(msg`Continue the dictation`)
		: i18n._(msg`Start the dictation`);
};

/** The one dictation toggle: starts a segment, finishes it, or waits while busy. */
export function MicButton({
	isRecording,
	isBusy,
	hasDraftText,
	onStart,
	onFinish,
}: Readonly<MicButtonProps>) {
	const { i18n } = useLingui();
	const buttonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		buttonRef.current?.focus();
	}, []);

	const label = getLabel(isRecording, hasDraftText, i18n);
	const handleClick = isRecording ? onFinish : onStart;

	return (
		<Tooltip
			position="top"
			disabled={isBusy}
			content={
				<>
					{label}{' '}
					<Kbd>
						<Trans>Enter</Trans>
					</Kbd>
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
