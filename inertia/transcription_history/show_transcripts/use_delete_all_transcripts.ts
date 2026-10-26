import { router } from '@inertiajs/react';
import { ConfirmModal } from '@minimalstuff/ui';

import { urlFor } from '~/shared/lib/url_for';

export function useDeleteAllTranscripts(): () => void {
	const confirmAndDeleteAll = async (): Promise<void> => {
		const isConfirmed = await ConfirmModal.call({
			title: 'Tout effacer ?',
			confirmLabel: 'Tout effacer',
			confirmColor: 'danger',
		});
		if (!isConfirmed) return;
		router.delete(urlFor('transcription_history.delete_transcripts'));
	};

	return () => {
		void confirmAndDeleteAll();
	};
}
