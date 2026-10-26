import { router } from '@inertiajs/react';
import { ConfirmModal } from '@minimalstuff/ui';

import { urlFor } from '~/shared/lib/url_for';

export function useDeleteTranscript(): (transcriptId: number) => void {
	const confirmAndDelete = async (transcriptId: number): Promise<void> => {
		const isConfirmed = await ConfirmModal.call({
			title: 'Supprimer cette dictée ?',
			confirmLabel: 'Supprimer',
			confirmColor: 'danger',
		});
		if (!isConfirmed) return;
		router.delete(
			urlFor('transcription_history.delete_transcript', { id: transcriptId }),
			{ preserveScroll: true }
		);
	};

	return (transcriptId) => {
		void confirmAndDelete(transcriptId);
	};
}
