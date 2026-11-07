import { useLingui } from '@lingui/react/macro';

import { requestDeleteCorrection } from '~/corrections/shared/request_delete_correction';
import { reportError } from '~/shared/errors/report_error';
import { reloadCorrections } from '~/user_settings/show_settings/reload_corrections';

const DELETE_FAILURE_TOAST_ID = 'delete-correction-failure';

/** Deletes a correction and refreshes the list; resolves to whether it worked, a failure being reported on screen. */
export function useDeleteCorrection(): (id: number) => Promise<boolean> {
	const { t } = useLingui();

	return async (id) => {
		try {
			await requestDeleteCorrection(id);
		} catch (error) {
			reportError(t`The correction could not be deleted, try again`, error, {
				toastId: DELETE_FAILURE_TOAST_ID,
			});
			return false;
		}
		await reloadCorrections();
		return true;
	};
}
