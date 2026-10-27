import { Trans } from '@lingui/react/macro';
import { Button } from '@minimalstuff/ui';

import { DictationPreviewResult } from './dictation_preview_result';
import { useCancelOnEscape } from './use_cancel_on_escape';
import { useDictationPreview } from './use_dictation_preview';
import { usePreviewCleanup } from './use_preview_cleanup';
import type { PreviewSettings } from '~/dictation/core/dictation_start_request';
import { DictationTranscript } from '~/dictation/show_dictation/dictation_transcript';
import { ErrorNotice } from '~/dictation/show_dictation/error_notice';
import { getLiveSegment } from '~/dictation/show_dictation/get_live_segment';
import { MicButton } from '~/dictation/show_dictation/mic_button';
import { RecordingStatus } from '~/dictation/show_dictation/recording_status';

type DictationPreviewProps = {
	settings: Readonly<PreviewSettings>;
	isDisabled: boolean;
};

const BUSY_STATUSES = new Set(['connecting', 'finishing', 'cleaning']);
const CANCELLABLE_STATUSES = new Set(['connecting', 'recording']);

/** Dictates for real with the form values and shows what the speech engine and the cleanup made of it. */
export function DictationPreview({
	settings,
	isDisabled,
}: Readonly<DictationPreviewProps>) {
	const dictation = useDictationPreview(settings);
	const cleanAgain = usePreviewCleanup();
	const { state, result } = dictation;
	const liveSegment = getLiveSegment(state);
	const isCancellable = CANCELLABLE_STATUSES.has(state.status);
	const rawText = result?.rawText ?? '';
	useCancelOnEscape(isCancellable, dictation.cancel);

	const handleStart = () => {
		cleanAgain.reset();
		dictation.start();
	};
	const handleCleanAgain = () => cleanAgain.clean(rawText, settings);

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-4">
				<MicButton
					isRecording={state.status === 'recording'}
					isBusy={BUSY_STATUSES.has(state.status) || isDisabled}
					hasDraftText={false}
					isFocusedOnMount={false}
					hasEnterHint={false}
					onStart={handleStart}
					onFinish={dictation.finish}
				/>
				{state.status === 'recording' && (
					<RecordingStatus
						startedAt={state.startedAt}
						levels={dictation.levels}
					/>
				)}
				{isCancellable && (
					<Button type="button" variant="ghost" onClick={dictation.cancel}>
						<Trans>Cancel</Trans>
					</Button>
				)}
			</div>
			{liveSegment !== null && (
				<DictationTranscript
					textBefore=""
					textAfter=""
					committedText={liveSegment.committedText}
					partialText={liveSegment.partialText}
					hasPlaceholder={state.status !== 'cleaning'}
					hasCaret={state.status === 'recording'}
				/>
			)}
			{state.status === 'error' && <ErrorNotice message={state.message} />}
			{state.status === 'cancelled' && (
				<p className="text-muted">
					<Trans>Test cancelled, nothing was kept.</Trans>
				</p>
			)}
			{result !== null && (
				<DictationPreviewResult
					result={result}
					cleanedText={cleanAgain.cleanedText ?? result.cleanedText}
					cleanErrorMessage={cleanAgain.errorMessage}
					isCleaning={cleanAgain.isCleaning}
					canCleanAgain={!isDisabled && !cleanAgain.isCleaning}
					onCleanAgain={handleCleanAgain}
				/>
			)}
		</div>
	);
}
