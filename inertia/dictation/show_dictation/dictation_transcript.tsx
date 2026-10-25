import { cn } from '~/shared/lib/cn';

type DictationTranscriptProps = {
	committedText: string;
	partialText: string;
	className?: string;
};

export const DictationTranscript = ({
	committedText,
	partialText,
	className,
}: Readonly<DictationTranscriptProps>) => (
	<p
		aria-live="polite"
		className={cn(
			'min-h-48 text-2xl leading-relaxed whitespace-pre-wrap',
			className
		)}
	>
		<span>{committedText}</span>
		<span className="text-gray-400 dark:text-gray-500">{partialText}</span>
	</p>
);
