import { router } from '@inertiajs/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';

import { logError } from '~/shared/errors/log_error';
import { urlFor } from '~/shared/lib/url_for';
import { describeCleanupError } from '~/transcription_history/show_transcripts/describe_cleanup_error';

const CLEAN_ERROR_FIELD = 'clean';

type UseCleanTranscriptReturn = {
	clean: () => void;
	isCleaning: boolean;
	errorMessage: string | null;
};

export function useCleanTranscript(
	transcriptId: number
): UseCleanTranscriptReturn {
	const { i18n } = useLingui();
	const [isCleaning, setIsCleaning] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const handleStart = () => {
		setIsCleaning(true);
		setErrorMessage(null);
	};
	const handleFinish = () => setIsCleaning(false);
	const handleError = (errors: Record<string, string>) => {
		logError('Transcript cleanup failed', errors);
		const code = errors[CLEAN_ERROR_FIELD];
		setErrorMessage(
			code === undefined ? null : describeCleanupError(code, i18n)
		);
	};

	const clean = () => {
		router.post(
			urlFor('transcription_history.clean_transcript', { id: transcriptId }),
			{},
			{
				preserveScroll: true,
				onStart: handleStart,
				onFinish: handleFinish,
				onError: handleError,
			}
		);
	};

	return { clean, isCleaning, errorMessage };
}
