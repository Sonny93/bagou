import { Trans } from '@lingui/react/macro';

import { LiveCaret } from './live_caret';
import { cn } from '~/shared/lib/cn';

type DictationTranscriptProps = {
	textBefore: string;
	textAfter: string;
	committedText: string;
	partialText: string;
	hasPlaceholder?: boolean;
	hasCaret?: boolean;
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
	segmentClassName,
}: Readonly<DictationTranscriptProps>) {
	const visibleCommittedText = committedText.trimStart();
	const visiblePartialText =
		visibleCommittedText === '' ? partialText.trimStart() : partialText;
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
		<p aria-live="polite" className="dictation-text whitespace-pre-wrap">
			{isEmpty && hasCaret && <LiveCaret />}
			{placeholder}
			<span>{textBefore}</span>
			<span className={segmentClassName}>{visibleCommittedText}</span>
			<span className={cn('text-muted', segmentClassName)}>
				{visiblePartialText}
			</span>
			{!isEmpty && hasCaret && <LiveCaret />}
			<span>{textAfter}</span>
		</p>
	);
}
