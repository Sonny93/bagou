import type { Data } from '@generated/data';
import { Badge, IconButton } from '@minimalstuff/ui';

import { formatTranscriptDate } from './format_transcript_date';
import { TranscriptRawText } from './transcript_raw_text';
import { useCleanTranscript } from './use_clean_transcript';
import { copyToClipboard } from '~/shared/lib/copy_to_clipboard';

const CLEAN_ICON = 'i-tabler-sparkles';
const CLEANING_ICON = 'i-tabler-loader-2 animate-spin';

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
	const { clean, isCleaning, errorMessage } = useCleanTranscript(transcript.id);

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
				{cleanedText === null && (
					<IconButton
						icon={isCleaning ? CLEANING_ICON : CLEAN_ICON}
						aria-label="Nettoyer le texte"
						aria-busy={isCleaning}
						variant="ghost"
						size="sm"
						tooltip
						disabled={isCleaning}
						onClick={clean}
					/>
				)}
				<IconButton
					icon="i-tabler-copy"
					aria-label="Copier le texte"
					variant="ghost"
					size="sm"
					tooltip
					onClick={handleCopy}
				/>
				<IconButton
					icon="i-tabler-trash"
					aria-label="Supprimer la dictée"
					variant="ghost"
					color="danger"
					size="sm"
					tooltip
					onClick={handleDelete}
				/>
			</div>
			<p className="whitespace-pre-wrap">{displayedText}</p>
			{errorMessage !== null && (
				<p role="alert" className="text-sm text-signal">
					{errorMessage}
				</p>
			)}
			{cleanedText !== null && <TranscriptRawText rawText={rawText} />}
		</li>
	);
}
