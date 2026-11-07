import type { Data } from '@generated/data';
import { useEffect, useRef, type RefObject } from 'react';

import { getCorrectionDeleteButtonId } from '~/user_settings/show_settings/correction_delete_button_id';
import { useDeleteCorrection } from '~/user_settings/show_settings/use_delete_correction';

type UseCorrectionsFocusReturn = {
	headingRef: RefObject<HTMLHeadingElement | null>;
	deleteCorrection: (id: number) => Promise<boolean>;
};

/**
 * Deletes a correction and keeps the focus where the user is working: the
 * delete button of the row that took its place, or the section heading when it
 * was the last row. It resolves to whether the correction was deleted.
 */
export function useCorrectionsFocus(
	corrections: readonly Data.Corrections.Correction[]
): UseCorrectionsFocusReturn {
	const headingRef = useRef<HTMLHeadingElement>(null);
	const pendingFocusIdRef = useRef<string | null | undefined>(undefined);
	const deleteWithReload = useDeleteCorrection();

	useEffect(() => {
		const pendingFocusId = pendingFocusIdRef.current;
		if (pendingFocusId === undefined) return;
		pendingFocusIdRef.current = undefined;
		const nextButton =
			pendingFocusId === null ? null : document.getElementById(pendingFocusId);
		(nextButton ?? headingRef.current)?.focus();
	}, [corrections]);

	const deleteCorrection = async (id: number) => {
		const index = corrections.findIndex((correction) => correction.id === id);
		const next = corrections[index + 1];
		pendingFocusIdRef.current =
			next === undefined ? null : getCorrectionDeleteButtonId(next.id);
		const isDeleted = await deleteWithReload(id);
		if (!isDeleted) pendingFocusIdRef.current = undefined;
		return isDeleted;
	};

	return { headingRef, deleteCorrection };
}
