import { useRef } from 'react';

import { DictationResult } from './dictation_result';
import { DictationTranscript } from './dictation_transcript';
import { ErrorNotice } from './error_notice';
import { IdleStage } from './idle_stage';
import { useFollowTranscript } from './use_follow_transcript';
import type { DictationState } from '~/dictation/core/dictation_state';

type DictationStageProps = {
	state: DictationState;
	editedText: string;
	onEditedTextChange: (text: string) => void;
	onStart: () => void;
};

function StageContent({
	state,
	editedText,
	onEditedTextChange,
	onStart,
}: Readonly<DictationStageProps>) {
	switch (state.status) {
		case 'idle':
			return <IdleStage onStart={onStart} />;
		case 'connecting':
			return (
				<DictationTranscript committedText="" partialText="" hasPlaceholder />
			);
		case 'recording':
			return (
				<DictationTranscript
					committedText={state.committedText}
					partialText={state.partialText}
					hasPlaceholder
					hasCaret
				/>
			);
		case 'finishing':
			return (
				<DictationTranscript
					committedText={state.committedText}
					partialText={state.partialText}
				/>
			);
		case 'cleaning':
			return (
				<DictationTranscript
					committedText={state.rawText}
					partialText=""
					className="opacity-60"
				/>
			);
		case 'done':
			return (
				<DictationResult text={editedText} onTextChange={onEditedTextChange} />
			);
		case 'cancelled':
			return (
				<p className="dictation-text my-auto text-muted">Dictée annulée.</p>
			);
		case 'error':
			return <ErrorNotice message={state.message} />;
	}
}

const getLiveTranscriptLength = (state: DictationState): number =>
	state.status === 'recording' || state.status === 'finishing'
		? state.committedText.length + state.partialText.length
		: 0;

export function DictationStage(props: Readonly<DictationStageProps>) {
	const scrollerRef = useRef<HTMLElement>(null);
	const isLive =
		props.state.status === 'recording' || props.state.status === 'finishing';
	useFollowTranscript(
		scrollerRef,
		getLiveTranscriptLength(props.state),
		isLive
	);

	return (
		<main ref={scrollerRef} className="min-h-0 flex-1 overflow-y-auto">
			<div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-4 py-6 sm:px-6 sm:py-10">
				<StageContent {...props} />
			</div>
		</main>
	);
}
