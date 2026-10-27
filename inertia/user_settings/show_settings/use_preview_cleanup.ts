import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';

import { describePreviewCleanupError } from './describe_preview_cleanup_error';
import { requestPreviewCleanup } from './request_preview_cleanup';
import type { PreviewSettings } from '~/dictation/core/dictation_start_request';
import { logError } from '~/shared/errors/log_error';

type UsePreviewCleanupReturn = {
	cleanedText: string | null;
	isCleaning: boolean;
	errorMessage: string | null;
	clean: (text: string, settings: Readonly<PreviewSettings>) => void;
	reset: () => void;
};

/**
 * Cleans a sample text with the given settings on explicit request. Runs
 * nothing by itself and keeps nothing on the server.
 */
export function usePreviewCleanup(): UsePreviewCleanupReturn {
	const { i18n } = useLingui();
	const [cleanedText, setCleanedText] = useState<string | null>(null);
	const [isCleaning, setIsCleaning] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const performClean = async (
		text: string,
		settings: Readonly<PreviewSettings>
	): Promise<void> => {
		setIsCleaning(true);
		setErrorMessage(null);
		try {
			setCleanedText(await requestPreviewCleanup({ text, settings }));
		} catch (error) {
			logError('Preview cleanup failed', error);
			setErrorMessage(describePreviewCleanupError(error, i18n));
		} finally {
			setIsCleaning(false);
		}
	};

	const clean = (text: string, settings: Readonly<PreviewSettings>) => {
		void performClean(text, settings);
	};

	const reset = () => {
		setCleanedText(null);
		setErrorMessage(null);
	};

	return { cleanedText, isCleaning, errorMessage, clean, reset };
}
