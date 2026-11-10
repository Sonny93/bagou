import { Trans } from '@lingui/react/macro';

import { LiveCaret } from '~/dictation/show_dictation/live_caret';
import { splitLiveWords } from '~/dictation/show_dictation/split_live_words';
import { useRevealDelays } from '~/dictation/show_dictation/use_reveal_delays';
import { cn } from '~/shared/lib/cn';

type DictationTranscriptProps = {
	textBefore: string;
	textAfter: string;
	committedText: string;
	partialText: string;
	hasPlaceholder?: boolean;
	hasCaret?: boolean;
	isAnnounced?: boolean;
	segmentClassName?: string;
};

/**
 * Read-only view of the draft around the insertion point, with the segment
 * being dictated in between.
 */
export function DictationTranscript({
	textBefore,
	textAfter,
	committedText,
	partialText,
	hasPlaceholder = false,
	hasCaret = false,
	isAnnounced = true,
	segmentClassName,
}: Readonly<DictationTranscriptProps>) {
	const visibleCommittedText = committedText.trimStart();
	const visiblePartialText =
		visibleCommittedText === '' ? partialText.trimStart() : partialText;
	const liveTokens = splitLiveWords(
		visibleCommittedText + visiblePartialText,
		visibleCommittedText.length
	);
	const revealDelays = useRevealDelays(
		liveTokens.filter((token) => token.isWord).map((token) => token.key)
	);
	const isEmpty =
		textBefore === '' &&
		textAfter === '' &&
		visibleCommittedText === '' &&
		visiblePartialText === '';
	const placeholder =
		isEmpty && hasPlaceholder ? (
			<span className="text-muted">
				<Trans>Speak, the text is written here.</Trans>
			</span>
		) : null;

	return (
		<p
			aria-live={isAnnounced ? 'polite' : 'off'}
			className="dictation-text whitespace-pre-wrap"
		>
			{isEmpty && hasCaret && <LiveCaret />}
			{placeholder}
			<span>{textBefore}</span>
			<span className="sr-only select-none">
				{visibleCommittedText}
				{visiblePartialText}
			</span>
			<span aria-hidden="true">
				{liveTokens.map((token) => (
					<span
						key={token.key}
						style={{ animationDelay: `${revealDelays.get(token.key) ?? 0}ms` }}
						className={cn(
							token.isWord && 'dictation-word',
							token.isPartial && 'text-muted',
							segmentClassName
						)}
					>
						{token.text}
					</span>
				))}
			</span>
			{!isEmpty && hasCaret && <LiveCaret />}
			<span>{textAfter}</span>
		</p>
	);
}
