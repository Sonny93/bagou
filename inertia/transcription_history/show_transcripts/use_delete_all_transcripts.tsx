import { router } from '@inertiajs/react';
import { useLingui } from '@lingui/react/macro';
import { ConfirmModal } from '@minimalstuff/ui';

import { describeDeletionCount } from './describe_deletion_count';
import { urlFor } from '~/shared/lib/url_for';

export function useDeleteAllTranscripts(transcriptCount: number): () => void {
	const { t, i18n } = useLingui();

	const confirmAndDeleteAll = async (): Promise<void> => {
		const isConfirmed = await ConfirmModal.call({
			title: t`Clear all?`,
			confirmLabel: t`Clear all`,
			confirmColor: 'danger',
			children: (
				<p className="text-sm text-muted">
					{describeDeletionCount(transcriptCount, i18n)}
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
