import { Button, Textarea } from '@minimalstuff/ui';
import { useState } from 'react';

import type { CopyStatus } from './copy_status';

type DictationResultProps = {
	text: string;
	isCleaned: boolean;
	copyStatus: CopyStatus;
	onCopy: (text: string) => void;
};

const COPY_STATUS_MESSAGES = {
	none: null,
	copied: 'Copié dans le presse-papier',
	failed: 'Copie impossible, utilise le bouton Copier',
} as const satisfies Record<CopyStatus, string | null>;

/** Final text, editable; the copy button copies the edited text, not `text`. */
export function DictationResult({
	text,
	isCleaned,
	copyStatus,
	onCopy,
}: Readonly<DictationResultProps>) {
	const [editedText, setEditedText] = useState(text);

	const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) =>
		setEditedText(event.target.value);
	const handleCopy = () => onCopy(editedText);

	return (
		<div className="flex flex-col gap-4">
			<Textarea
				label="Texte dicté"
				value={editedText}
				onChange={handleChange}
				rows={8}
				className="text-xl leading-relaxed"
			/>
			<div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
				<Button onClick={handleCopy} startIcon="i-tabler-copy">
					Copier
				</Button>
				<output>{COPY_STATUS_MESSAGES[copyStatus]}</output>
				{!isCleaned && <span>Nettoyage indisponible, texte brut</span>}
			</div>
		</div>
	);
}
