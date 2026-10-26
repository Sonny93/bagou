import type { Data } from '@generated/data';
import { Button } from '@minimalstuff/ui';

import { AppHeader } from '~/shared/ui/app_header';
import { AppThemeToggle } from '~/shared/ui/app_theme_toggle';
import { BackToDictationLink } from '~/shared/ui/back_to_dictation_link';
import { TranscriptEmptyState } from '~/transcription_history/show_transcripts/transcript_empty_state';
import { TranscriptFeed } from '~/transcription_history/show_transcripts/transcript_feed';
import { TranscriptSearchInput } from '~/transcription_history/show_transcripts/transcript_search_input';
import { useDeleteAllTranscripts } from '~/transcription_history/show_transcripts/use_delete_all_transcripts';
import { useDeleteTranscript } from '~/transcription_history/show_transcripts/use_delete_transcript';
import { useTranscriptSearch } from '~/transcription_history/show_transcripts/use_transcript_search';

type ShowTranscriptsProps = {
	transcripts: { data: Data.Transcript[] };
	query: string;
	transcriptCount: number;
};

export default function ShowTranscripts({
	transcripts,
	query,
	transcriptCount,
}: Readonly<ShowTranscriptsProps>) {
	const { searchText, setSearchText } = useTranscriptSearch(query);
	const deleteTranscript = useDeleteTranscript();
	const deleteAllTranscripts = useDeleteAllTranscripts(transcriptCount);
	const hasTranscripts = transcripts.data.length > 0;

	return (
		<div className="flex min-h-dvh flex-col">
			<AppHeader maxWidthClassName="max-w-xl">
				<BackToDictationLink />
				<AppThemeToggle />
			</AppHeader>
			<main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-6 sm:px-6">
				<div className="flex items-start justify-between gap-3">
					<div className="flex flex-col gap-1">
						<h1 className="text-2xl font-semibold">Historique</h1>
						<p className="text-muted">Tes dictées des 60 derniers jours.</p>
					</div>
					{transcriptCount > 0 && (
						<Button
							variant="ghost"
							color="danger"
							startIcon="i-tabler-trash"
							onClick={deleteAllTranscripts}
						>
							Tout effacer
						</Button>
					)}
				</div>
				<TranscriptSearchInput value={searchText} onChange={setSearchText} />
				{hasTranscripts ? (
					<TranscriptFeed
						transcripts={transcripts.data}
						onDelete={deleteTranscript}
					/>
				) : (
					<TranscriptEmptyState isSearching={query !== ''} />
				)}
			</main>
		</div>
	);
}
