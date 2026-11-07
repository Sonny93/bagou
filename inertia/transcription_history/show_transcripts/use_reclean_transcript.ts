import { useLingui } from '@lingui/react/macro';
import { useEffect, useRef, useState } from 'react';

import type { CleanupQuality } from '~/shared/cleanup_quality';
import { CLEANUP_QUALITY_LABELS } from '~/shared/cleanup_quality_labels';
import { describeCleanupRequestError } from '~/shared/errors/describe_cleanup_request_error';
import { logError } from '~/shared/errors/log_error';
import { CLEANUP_REQUEST_TIMEOUT_MS } from '~/shared/lib/cleanup_request_timeout';
import { copyToClipboard } from '~/shared/lib/copy_to_clipboard';
import { requestRecleanTranscript } from '~/transcription_history/show_transcripts/request_reclean_transcript';
import {
	type QualityEntries,
	updateQualityEntries,
} from '~/transcription_history/show_transcripts/update_quality_entries';

type UseRecleanTranscriptReturn = {
	previews: QualityEntries<string>;
	runningQualities: QualityEntries<true>;
	errorMessage: string | null;
	announcement: string;
	reclean: (quality: CleanupQuality) => void;
	discard: (quality: CleanupQuality) => void;
	copy: (quality: CleanupQuality) => void;
};

/**
 * Cleans the raw text of a history entry again, one quality at a time, to
 * compare them. The results only live here: nothing is saved. A quality that
 * is already running is ignored, running one again replaces only its own
 * preview, and leaving the page aborts the requests.
 */
export function useRecleanTranscript(
	transcriptId: number
): UseRecleanTranscriptReturn {
	const { t, i18n } = useLingui();
	const [previews, setPreviews] = useState<QualityEntries<string>>({});
	const [runningQualities, setRunningQualities] = useState<
		QualityEntries<true>
	>({});
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [announcement, setAnnouncement] = useState('');
	const controllersRef = useRef(new Set<AbortController>());
	const runningRef = useRef<QualityEntries<true>>({});
	const previewsRef = useRef<QualityEntries<string>>({});
	const announcementFrameRef = useRef<number | null>(null);
	useEffect(() => {
		const controllers = controllersRef.current;
		return () => {
			controllers.forEach((controller) => controller.abort());
			if (announcementFrameRef.current !== null) {
				cancelAnimationFrame(announcementFrameRef.current);
			}
		};
	}, []);

	const announce = (text: string) => {
		if (announcementFrameRef.current !== null) {
			cancelAnimationFrame(announcementFrameRef.current);
		}
		setAnnouncement('');
		announcementFrameRef.current = requestAnimationFrame(() => {
			announcementFrameRef.current = null;
			setAnnouncement(text);
		});
	};

	const describeQuality = (quality: CleanupQuality): string =>
		i18n._(CLEANUP_QUALITY_LABELS[quality]);

	const setRunning = (quality: CleanupQuality, isRunning: boolean) => {
		runningRef.current = updateQualityEntries(
			runningRef.current,
			quality,
			isRunning ? true : null
		);
		setRunningQualities(runningRef.current);
	};

	const setPreview = (quality: CleanupQuality, text: string | null) => {
		previewsRef.current = updateQualityEntries(
			previewsRef.current,
			quality,
			text
		);
		setPreviews(previewsRef.current);
	};

	const reclean = async (quality: CleanupQuality) => {
		if (runningRef.current[quality]) return;
		const controller = new AbortController();
		controllersRef.current.add(controller);
		setRunning(quality, true);
		setErrorMessage(null);
		announce('');
		try {
			const cleanedText = await requestRecleanTranscript({
				transcriptId,
				cleanupQuality: quality,
				signal: controller.signal,
				timeoutMs: CLEANUP_REQUEST_TIMEOUT_MS,
			});
			setPreview(quality, cleanedText);
			const qualityLabel = describeQuality(quality);
			announce(t`${qualityLabel} version ready`);
		} catch (error) {
			if (controller.signal.aborted) return;
			logError('Cleaning a history entry again failed', error);
			const message = describeCleanupRequestError(error, i18n);
			setErrorMessage(message);
			announce(message);
		} finally {
			controllersRef.current.delete(controller);
			if (!controller.signal.aborted) setRunning(quality, false);
		}
	};

	const copy = async (quality: CleanupQuality) => {
		const text = previewsRef.current[quality];
		if (text === undefined) return;
		setErrorMessage(null);
		const isCopied = await copyToClipboard(text);
		const qualityLabel = describeQuality(quality);
		if (isCopied) {
			announce(t`${qualityLabel} version copied`);
			return;
		}
		logError('Copying a cleaned version failed', quality);
		const message = t`Copy failed`;
		setErrorMessage(message);
		announce(message);
	};

	return {
		previews,
		runningQualities,
		errorMessage,
		announcement,
		reclean: (quality) => void reclean(quality),
		discard: (quality) => {
			setErrorMessage(null);
			setPreview(quality, null);
		},
		copy: (quality) => void copy(quality),
	};
}
