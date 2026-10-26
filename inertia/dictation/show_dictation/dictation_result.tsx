import { cn } from '~/shared/lib/cn';

type DictationResultProps = {
	text: string;
	onTextChange: (text: string) => void;
};

/** Final text, editable; the copy button copies the edited text, not the dictated one. */
export function DictationResult({
	text,
	onTextChange,
}: Readonly<DictationResultProps>) {
	const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) =>
		onTextChange(event.target.value);

	return (
		<textarea
			aria-label="Texte dicté"
			value={text}
			onChange={handleChange}
			className={cn(
				'dictation-text min-h-48 w-full flex-1 resize-none rounded-md border-0 bg-transparent p-0 text-ink [field-sizing:content]',
				'focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-accent-600/40 dark:focus-visible:outline-accent-400/40'
			)}
		/>
	);
}
