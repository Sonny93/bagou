import { useLingui } from '@lingui/react/macro';
import { useRef } from 'react';

import type { CorrectionPair } from '~/dictation/core/correction_pair';
import { CorrectionSuggestion } from '~/dictation/show_dictation/correction_suggestion';
import { describeSuggestionAnnouncement } from '~/dictation/show_dictation/describe_suggestion_announcement';
import { useRememberCorrection } from '~/dictation/show_dictation/use_remember_correction';
import { useStripFocus } from '~/dictation/show_dictation/use_strip_focus';

type CorrectionStripProps = {
	queue: readonly CorrectionPair[];
	isEditable: boolean;
	onResolve: (pair: CorrectionPair) => void;
	onDismiss: (pair: CorrectionPair) => void;
};

/**
 * Offers the first correction found in the draft, above the dock. The
 * announcement region stays mounted, so a new suggestion is read out once.
 */
export function CorrectionStrip({
	queue,
	isEditable,
	onResolve,
	onDismiss,
}: Readonly<CorrectionStripProps>) {
	const { i18n } = useLingui();
	const rememberButtonRef = useRef<HTMLButtonElement>(null);
	const { remember, isRemembering, isFull } = useRememberCorrection(onResolve);
	const [current] = queue;
	const { expectFocusMove, cancelFocusMove } = useStripFocus(
		current,
		rememberButtonRef
	);
	const isVisible = isEditable && !isFull && current !== undefined;

	const rememberCurrent = async (pair: CorrectionPair) => {
		expectFocusMove();
		const outcome = await remember(pair);
		if (outcome === 'kept') cancelFocusMove();
	};

	const handleRemember = () => {
		if (current !== undefined) void rememberCurrent(current);
	};

	const handleDismiss = () => {
		if (current === undefined) return;
		expectFocusMove();
		onDismiss(current);
	};

	const announcement = isVisible
		? describeSuggestionAnnouncement(current, queue.length, i18n)
		: '';

	return (
		<>
			<output className="sr-only">{announcement}</output>
			{isVisible && (
				<div className="shrink-0 border-t border-line bg-surface">
					<CorrectionSuggestion
						pair={current}
						position={1}
						total={queue.length}
						isRemembering={isRemembering}
						rememberButtonRef={rememberButtonRef}
						onRemember={handleRemember}
						onDismiss={handleDismiss}
					/>
				</div>
			)}
		</>
	);
}
