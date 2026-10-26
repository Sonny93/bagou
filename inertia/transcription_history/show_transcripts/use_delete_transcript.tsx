import type { Data } from '@generated/data';
import { router } from '@inertiajs/react';
import { ConfirmModal } from '@minimalstuff/ui';

import { TranscriptQuote } from './transcript_quote';
import { urlFor } from '~/shared/lib/url_for';

export function useDeleteTranscript(): (transcript: Data.Transcript) => void {
	const confirmAndDelete = async (
		transcript: Data.Transcript
	): Promise<void> => {
		const isConfirmed = await ConfirmModal.call({
			title: 'Supprimer cette dictée ?',
			confirmLabel: 'Supprimer',
			confirmColor: 'danger',
			children: (
				<TranscriptQuote
					text={transcript.cleanedText ?? transcript.rawText}
					createdAt={transcript.createdAt}
				/>
			),
		});
		if (!isConfirmed) return;
		router.delete(
			urlFor('transcription_history.delete_transcript', { id: transcript.id }),
			{ preserveScroll: true }
		);
	};

	return (transcript) => {
		void confirmAndDelete(transcript);
	};
}
