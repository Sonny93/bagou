import { useLingui } from '@lingui/react/macro';
import { useEffect, useRef } from 'react';

import { requestDismissSuggestions } from '~/correction_suggestions/shared/request_dismiss_suggestions';
import { sendInChunks } from '~/correction_suggestions/shared/send_in_chunks';
import { describeCorrectionFailure } from '~/corrections/shared/describe_correction_failure';
import { readCorrectionFailure } from '~/corrections/shared/read_correction_failure';
import {
	clearDismissedCorrections,
	readDismissedCorrections,
} from '~/dictation/show_dictation/dismissed_corrections';
import { reportError } from '~/shared/errors/report_error';

const IMPORT_CHUNK_SIZE = 200;
const IMPORT_FAILURE_TOAST_ID = 'import-dismissed-corrections-failure';

/**
 * Sends the corrections dismissed on this device before dismissals were kept
 * on the server, once, then forgets them. A failure keeps them for the next
 * visit.
 */
export function useImportDismissedCorrections(): void {
	const { i18n } = useLingui();
	const hasStartedRef = useRef(false);

	useEffect(() => {
		if (hasStartedRef.current) return;
		hasStartedRef.current = true;
		const pairs = readDismissedCorrections();
		if (pairs.length === 0) return;
		sendInChunks(pairs, IMPORT_CHUNK_SIZE, requestDismissSuggestions).then(
			() => clearDismissedCorrections(),
			(error: unknown) => {
				const failure = readCorrectionFailure(error);
				reportError(describeCorrectionFailure(failure, i18n), error, {
					toastId: IMPORT_FAILURE_TOAST_ID,
				});
			}
		);
	}, [i18n]);
}
