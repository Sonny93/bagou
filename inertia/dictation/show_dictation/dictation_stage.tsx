import { useRef } from 'react';

import { StageContent, type StageDraft } from './stage_content';
import { useFollowTranscript } from './use_follow_transcript';
import type { DictationState } from '~/dictation/core/dictation_state';

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

	return (
		<main ref={scrollerRef} className="min-h-0 flex-1 overflow-y-auto">
			<div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-4 py-6 sm:px-6 sm:py-10">
				<StageContent state={state} draft={draft} />
			</div>
		</main>
	);
}
