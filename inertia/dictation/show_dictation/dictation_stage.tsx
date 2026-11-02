import { useRef } from 'react';

import type { DictationState } from '~/dictation/core/dictation_state';
import { CleanupProgressOverlay } from '~/dictation/show_dictation/cleanup_progress_overlay';
import {
	StageContent,
	type StageDraft,
} from '~/dictation/show_dictation/stage_content';
import { useFollowTranscript } from '~/dictation/show_dictation/use_follow_transcript';

type DictationStageProps = {
	state: DictationState;
	draft: StageDraft;
};

const getLiveTranscriptLength = (state: DictationState): number =>
	state.status === 'recording' || state.status === 'finishing'
		? state.committedText.length + state.partialText.length
		: 0;

export function DictationStage({
	state,
	draft,
}: Readonly<DictationStageProps>) {
	const scrollerRef = useRef<HTMLElement>(null);
	const isLive = state.status === 'recording' || state.status === 'finishing';
	useFollowTranscript(scrollerRef, getLiveTranscriptLength(state), isLive);

	const isCleaning = state.status === 'cleaning';

	return (
		<div className="relative flex min-h-0 flex-1 flex-col">
			<main ref={scrollerRef} className="min-h-0 flex-1 overflow-y-auto">
				<div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-4 py-6 sm:px-6 sm:py-10">
					<StageContent state={state} draft={draft} />
				</div>
			</main>
			<CleanupProgressOverlay
				isActive={isCleaning}
				percent={isCleaning ? state.progress : 100}
			/>
		</div>
	);
}
