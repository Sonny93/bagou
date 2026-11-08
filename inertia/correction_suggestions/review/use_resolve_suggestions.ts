import { useLingui } from '@lingui/react/macro';
import { useCallback, useState } from 'react';

import { LIST_FULL_MESSAGE } from '~/correction_suggestions/review/list_full_message';
import {
	useRowStatuses,
	type RowStatus,
} from '~/correction_suggestions/review/use_row_statuses';
import type { ReviewItem } from '~/correction_suggestions/shared/build_review_list';
import { requestDismissSuggestions } from '~/correction_suggestions/shared/request_dismiss_suggestions';
import { describeCorrectionFailure } from '~/corrections/shared/describe_correction_failure';
import {
	readCorrectionFailure,
	type CorrectionFailure,
} from '~/corrections/shared/read_correction_failure';
import { requestAddCorrection } from '~/corrections/shared/request_add_correction';
import type { CorrectionPair } from '~/dictation/core/correction_pair';
import { logError } from '~/shared/errors/log_error';
import { reportError } from '~/shared/errors/report_error';

const RESOLVE_FAILURE_TOAST_ID = 'resolve-correction-suggestion-failure';
const FULL_CODE = 'E_CORRECTIONS_FULL';

/** `resolved`: the row is done. `kept`: the request failed, the row stays. `full`: it failed because the list of corrections is full. */
type ResolveOutcome = 'resolved' | 'kept' | 'full';

type UseResolveSuggestionsOptions = {
	onResolved: (pair: CorrectionPair) => void;
	onAnnounce: (message: string) => void;
};

export type UseResolveSuggestionsReturn = {
	statuses: ReadonlyMap<string, RowStatus>;
	isFull: boolean;
	clearFull: () => void;
	remember: (item: ReviewItem) => Promise<ResolveOutcome>;
	dismiss: (item: ReviewItem) => Promise<ResolveOutcome>;
	getResolvedKeys: () => ReadonlySet<string>;
	getBusyKeys: () => ReadonlySet<string>;
};

/**
 * Remembers or dismisses the suggestions of the review, one request per row,
 * and says how each ended. A pair the server finds invalid is dismissed,
 * since it could never be remembered; a full list turns off `remember` for
 * every row until `clearFull` is called. Each result is handed to
 * `onAnnounce` for a live region.
 */
export function useResolveSuggestions({
	onResolved,
	onAnnounce,
}: Readonly<UseResolveSuggestionsOptions>): UseResolveSuggestionsReturn {
	const { i18n, t } = useLingui();
	const { statuses, setStatus, getResolvedKeys, getBusyKeys } =
		useRowStatuses();
	const [isFull, setIsFull] = useState(false);
	const clearFull = useCallback(() => setIsFull(false), []);

	const reportFailure = (error: unknown): CorrectionFailure => {
		const failure = readCorrectionFailure(error);
		reportError(describeCorrectionFailure(failure, i18n), error, {
			toastId: RESOLVE_FAILURE_TOAST_ID,
		});
		return failure;
	};

	const finish = (item: ReviewItem, status: 'remembered' | 'dismissed') => {
		const { heard, written } = item;
		setStatus(item.key, status);
		onResolved({ heard, written });
		onAnnounce(
			status === 'remembered'
				? t`Remembered: ${written} for ${heard}`
				: t`Dismissed: ${written} for ${heard}`
		);
	};

	const dropInvalid = async (item: ReviewItem) => {
		await requestDismissSuggestions([item]).catch((error: unknown) =>
			logError('The invalid suggestion could not be dismissed', error)
		);
		finish(item, 'dismissed');
	};

	const remember = async (item: ReviewItem): Promise<ResolveOutcome> => {
		setStatus(item.key, 'remembering');
		try {
			await requestAddCorrection(item);
			finish(item, 'remembered');
			return 'resolved';
		} catch (error) {
			const failure = reportFailure(error);
			if (failure.kind === 'fields') {
				await dropInvalid(item);
				return 'resolved';
			}
			setStatus(item.key, null);
			const isListFull = failure.kind === 'code' && failure.code === FULL_CODE;
			if (isListFull) onAnnounce(i18n._(LIST_FULL_MESSAGE));
			setIsFull((wasFull) => wasFull || isListFull);
			return isListFull ? 'full' : 'kept';
		}
	};

	const dismiss = async (item: ReviewItem): Promise<ResolveOutcome> => {
		setStatus(item.key, 'dismissing');
		try {
			await requestDismissSuggestions([item]);
			finish(item, 'dismissed');
			return 'resolved';
		} catch (error) {
			reportFailure(error);
			setStatus(item.key, null);
			return 'kept';
		}
	};

	return {
		statuses,
		isFull,
		clearFull,
		remember,
		dismiss,
		getResolvedKeys,
		getBusyKeys,
	};
}
