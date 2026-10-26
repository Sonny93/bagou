import { LiveCaret } from './live_caret';
import { cn } from '~/shared/lib/cn';

const PLACEHOLDER = "Parle, le texte s'écrit ici.";

type DictationTranscriptProps = {
	committedText: string;
	partialText: string;
	hasPlaceholder?: boolean;
	hasCaret?: boolean;
	className?: string;
};

export function DictationTranscript({
	committedText,
	partialText,
	hasPlaceholder = false,
	hasCaret = false,
	className,
}: Readonly<DictationTranscriptProps>) {
	const isEmpty = committedText === '' && partialText === '';
	const placeholder =
		isEmpty && hasPlaceholder ? (
			<span className="text-muted">{PLACEHOLDER}</span>
		) : null;

	return (
		<p
			aria-live="polite"
			className={cn('dictation-text whitespace-pre-wrap', className)}
		>
			{isEmpty && hasCaret && <LiveCaret />}
			{placeholder}
			<span>{committedText}</span>
			<span className="text-muted">{partialText}</span>
			{!isEmpty && hasCaret && <LiveCaret />}
		</p>
	);
}
