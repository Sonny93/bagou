import { router } from '@inertiajs/react';
import { useState } from 'react';

import { urlFor } from '~/shared/lib/url_for';

const CLEAN_ERROR_FIELD = 'clean';

type UseCleanTranscriptReturn = {
	clean: () => void;
	isCleaning: boolean;
	errorMessage: string | null;
};

export function useCleanTranscript(
	transcriptId: number
): UseCleanTranscriptReturn {
	const [isCleaning, setIsCleaning] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const handleStart = () => {
		setIsCleaning(true);
		setErrorMessage(null);
	};
	const handleFinish = () => setIsCleaning(false);
	const handleError = (errors: Record<string, string>) =>
		setErrorMessage(errors[CLEAN_ERROR_FIELD] ?? null);

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
