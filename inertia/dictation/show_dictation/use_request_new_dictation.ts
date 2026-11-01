import { useLingui } from '@lingui/react/macro';
import { ConfirmModal } from '@minimalstuff/ui';
import { useCallback, useState } from 'react';

import { createNewDictationRequester } from './create_new_dictation_request';
import { isUnsavedSaveStatus } from './is_unsaved_save_status';
import type { SaveStatus } from './save_status';

type UseRequestNewDictationOptions = {
	saveStatus: SaveStatus;
	startNew: () => void;
};

/**
 * Returns the action that starts a new dictation, which clears the draft: it
 * asks for confirmation first while the draft may not be in the history.
 */
export function useRequestNewDictation({
	saveStatus,
	startNew,
}: Readonly<UseRequestNewDictationOptions>): () => void {
	const { t } = useLingui();
	const [requester] = useState(createNewDictationRequester);

	return useCallback(() => {
		void requester.request({
			isUnsaved: isUnsavedSaveStatus(saveStatus),
			confirm: () =>
				ConfirmModal.call({
					title: t`Start a new dictation?`,
					confirmLabel: t`Start new`,
					confirmColor: 'danger',
					children: t`Your text is not saved in the history yet. A new dictation clears it.`,
				}),
			startNew,
		});
	}, [requester, saveStatus, startNew, t]);
}
