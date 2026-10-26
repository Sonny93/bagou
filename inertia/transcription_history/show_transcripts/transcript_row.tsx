import type { Data } from '@generated/data';
import { Badge, IconButton } from '@minimalstuff/ui';

import { formatTranscriptDate } from './format_transcript_date';
import { TranscriptRawText } from './transcript_raw_text';
import { copyToClipboard } from '~/shared/lib/copy_to_clipboard';

type TranscriptRowProps = {
	transcript: Data.Transcript;
	onDelete: (transcript: Data.Transcript) => void;
};

export function TranscriptRow({
	transcript,
	onDelete,
}: Readonly<TranscriptRowProps>) {
	const { cleanedText, rawText } = transcript;
	const displayedText = cleanedText ?? rawText;

	const handleCopy = () => void copyToClipboard(displayedText);
	const handleDelete = () => onDelete(transcript);

	return (
		<li className="flex flex-col gap-2 px-4 py-3">
			<div className="flex items-center gap-2">
				<span className="flex-1 text-sm text-muted">
					{formatTranscriptDate(transcript.createdAt)}
				</span>
				{cleanedText === null && (
					<Badge color="warning" variant="subtle">
						non nettoyé
					</Badge>
				)}
				<IconButton
					icon="i-tabler-copy"
					aria-label="Copier le texte"
					variant="ghost"
					size="sm"
					onClick={handleCopy}
				/>
				<IconButton
					icon="i-tabler-trash"
					aria-label="Supprimer la dictée"
					variant="ghost"
					color="danger"
					size="sm"
					onClick={handleDelete}
				/>
			</div>
			<p className="whitespace-pre-wrap">{displayedText}</p>
			{cleanedText !== null && <TranscriptRawText rawText={rawText} />}
		</li>
	);
}
