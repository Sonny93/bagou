import type { Data } from '@generated/data';
import { useLingui } from '@lingui/react/macro';
import { Badge, IconButton } from '@minimalstuff/ui';
import { useRef } from 'react';

import type { CleanupQuality } from '~/shared/cleanup_quality';
import { copyToClipboard } from '~/shared/lib/copy_to_clipboard';
import { formatTranscriptFullDate } from '~/transcription_history/show_transcripts/format_transcript_full_date';
import { RecleanMenu } from '~/transcription_history/show_transcripts/reclean_menu';
import { RecleanPreviews } from '~/transcription_history/show_transcripts/reclean_previews';
import { RecleanStatus } from '~/transcription_history/show_transcripts/reclean_status';
import { TranscriptRawText } from '~/transcription_history/show_transcripts/transcript_raw_text';
import { useCleanTranscript } from '~/transcription_history/show_transcripts/use_clean_transcript';
import { useRecleanTranscript } from '~/transcription_history/show_transcripts/use_reclean_transcript';

const CLEAN_ICON = 'i-tabler-sparkles';
const CLEANING_ICON = 'i-tabler-loader-2 animate-spin';

type TranscriptRowProps = {
	dateLabel: string;
	accessibleDate: string;
	transcript: Data.Transcript;
	onDelete: (transcript: Data.Transcript) => void;
};

export function TranscriptRow({
	dateLabel,
	accessibleDate,
	transcript,
	onDelete,
}: Readonly<TranscriptRowProps>) {
	const { t, i18n } = useLingui();
	const { cleanedText, rawText } = transcript;
	const fullDate = formatTranscriptFullDate(transcript.createdAt, i18n.locale);
	const displayedText = cleanedText ?? rawText;
	const { clean, isCleaning, errorMessage } = useCleanTranscript(transcript.id);
	const reclean = useRecleanTranscript(transcript.id);
	const recleanMenuRef = useRef<HTMLSpanElement>(null);

	const handleCopy = () => void copyToClipboard(displayedText);
	const handleDelete = () => onDelete(transcript);
	const handleDiscard = (quality: CleanupQuality) => {
		reclean.discard(quality);
		recleanMenuRef.current?.querySelector('button')?.focus();
	};
	const isRecleaning = Object.keys(reclean.runningQualities).length > 0;

	return (
		<li className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4">
			<div className="flex flex-wrap items-center gap-2">
				<time
					dateTime={transcript.createdAt}
					title={fullDate}
					className="min-w-24 flex-1 text-sm text-muted"
				>
					{dateLabel}
				</time>
				{cleanedText === null && (
					<Badge color="warning" variant="subtle">
						{t`not cleaned`}
					</Badge>
				)}
				{cleanedText === null && (
					<IconButton
						icon={isCleaning ? CLEANING_ICON : CLEAN_ICON}
						aria-label={t`Clean the dictation from ${accessibleDate}`}
						aria-busy={isCleaning}
						variant="ghost"
						size="sm"
						tooltip
						disabled={isCleaning}
						onClick={clean}
					/>
				)}
				<RecleanMenu
					accessibleDate={accessibleDate}
					runningQualities={reclean.runningQualities}
					menuRef={recleanMenuRef}
					onReclean={reclean.reclean}
				/>
				<IconButton
					icon="i-tabler-copy"
					aria-label={t`Copy the dictation from ${accessibleDate}`}
					variant="ghost"
					size="sm"
					tooltip
					onClick={handleCopy}
				/>
				<IconButton
					icon="i-tabler-trash"
					aria-label={t`Delete the dictation from ${accessibleDate}`}
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
			<RecleanStatus
				isRunning={isRecleaning}
				errorMessage={reclean.errorMessage}
				announcement={reclean.announcement}
			/>
			<RecleanPreviews
				previews={reclean.previews}
				onCopy={reclean.copy}
				onDiscard={handleDiscard}
			/>
			{cleanedText !== null && <TranscriptRawText rawText={rawText} />}
		</li>
	);
}
