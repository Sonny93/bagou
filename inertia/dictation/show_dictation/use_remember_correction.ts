import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';

import { describeCorrectionFailure } from '~/corrections/shared/describe_correction_failure';
import { readCorrectionFailure } from '~/corrections/shared/read_correction_failure';
import { requestAddCorrection } from '~/corrections/shared/request_add_correction';
import type { CorrectionPair } from '~/dictation/core/correction_pair';
import { focusDraftTextarea } from '~/dictation/show_dictation/draft_textarea';
import { reportError } from '~/shared/errors/report_error';

const REMEMBER_FAILURE_TOAST_ID = 'remember-correction-failure';
const FULL_CODE = 'E_CORRECTIONS_FULL';

type RememberOutcome = 'remembered' | 'removed' | 'kept';

type UseRememberCorrectionReturn = {
	remember: (pair: CorrectionPair) => Promise<RememberOutcome>;
	isRemembering: boolean;
	isFull: boolean;
};

/**
 * Sends a suggested correction to the server. It resolves to whether the pair
 * was remembered, taken out of the queue without being remembered, or kept. A failure is reported on screen; a pair the server finds
 * invalid is taken out of the queue, since it could never be remembered, and
 * a full list stops the suggestions.
 */
export function useRememberCorrection(
	resolve: (pair: CorrectionPair) => void
): UseRememberCorrectionReturn {
	const { i18n } = useLingui();
	const [isRemembering, setIsRemembering] = useState(false);
	const [isFull, setIsFull] = useState(false);

	const remember = async (pair: CorrectionPair): Promise<RememberOutcome> => {
		setIsRemembering(true);
		try {
			await requestAddCorrection(pair);
			resolve(pair);
			return 'remembered';
		} catch (error) {
			const failure = readCorrectionFailure(error);
			const isInvalid = failure.kind === 'fields';
			if (isInvalid) resolve(pair);
			if (failure.kind === 'code' && failure.code === FULL_CODE) {
				setIsFull(true);
				focusDraftTextarea();
			}
			reportError(describeCorrectionFailure(failure, i18n), error, {
				toastId: REMEMBER_FAILURE_TOAST_ID,
			});
			return isInvalid ? 'removed' : 'kept';
		} finally {
			setIsRemembering(false);
		}
	};

	return { remember, isRemembering, isFull };
}
