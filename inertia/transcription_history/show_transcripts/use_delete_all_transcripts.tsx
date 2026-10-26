import { router } from '@inertiajs/react';
import { ConfirmModal } from '@minimalstuff/ui';

import { describeDeletionCount } from './describe_deletion_count';
import { urlFor } from '~/shared/lib/url_for';

export function useDeleteAllTranscripts(transcriptCount: number): () => void {
	const confirmAndDeleteAll = async (): Promise<void> => {
		const isConfirmed = await ConfirmModal.call({
			title: 'Tout effacer ?',
			confirmLabel: 'Tout effacer',
			confirmColor: 'danger',
			children: (
				<p className="text-sm text-muted">
					{describeDeletionCount(transcriptCount)}
				</p>
			),
		});
		if (!isConfirmed) return;
		router.delete(urlFor('transcription_history.delete_transcripts'));
	};

	return () => {
		void confirmAndDeleteAll();
	};
}
