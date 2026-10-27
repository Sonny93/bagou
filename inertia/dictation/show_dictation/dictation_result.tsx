import { useLingui } from '@lingui/react/macro';
import { useLayoutEffect, useRef } from 'react';

import type { DraftSelection } from '~/dictation/core/dictation_draft';
import { cn } from '~/shared/lib/cn';

type DictationResultProps = {
	text: string;
	selection: DraftSelection;
	onTextChange: (text: string, selection: DraftSelection) => void;
	onSelectionChange: (selection: DraftSelection) => void;
};

const readSelection = (element: HTMLTextAreaElement): DraftSelection => ({
	start: element.selectionStart,
	end: element.selectionEnd,
});

/**
 * The draft, editable. The next dictated segment lands at its selection, which
 * is restored here after the text was changed from outside.
 */
export function DictationResult({
	text,
	selection,
	onTextChange,
	onSelectionChange,
}: Readonly<DictationResultProps>) {
	const { t } = useLingui();
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	useLayoutEffect(() => {
		const textarea = textareaRef.current;
		if (!textarea) return;
		if (
			textarea.selectionStart === selection.start &&
			textarea.selectionEnd === selection.end
		)
			return;
		textarea.setSelectionRange(selection.start, selection.end);
	}, [text, selection.start, selection.end]);

	const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) =>
		onTextChange(event.target.value, readSelection(event.target));

	const handleSelect = (event: React.SyntheticEvent<HTMLTextAreaElement>) =>
		onSelectionChange(readSelection(event.currentTarget));

	return (
		<textarea
			ref={textareaRef}
			aria-label={t`Dictated text`}
			placeholder={t`Press Enter or the mic to dictate.`}
			value={text}
			onChange={handleChange}
			onSelect={handleSelect}
			className={cn(
				'dictation-text min-h-48 w-full flex-1 resize-none rounded-md border-0 bg-transparent p-0 text-ink placeholder:text-muted [field-sizing:content]',
				'focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-accent-600/40 dark:focus-visible:outline-accent-400/40'
			)}
		/>
	);
}
