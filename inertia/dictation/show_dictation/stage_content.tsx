import { DictationResult } from './dictation_result';
import { DictationTranscript } from './dictation_transcript';
import { getLiveSegment } from './get_live_segment';
import { StageNotice } from './stage_notice';
import {
	splitDraft,
	type DraftSelection,
} from '~/dictation/core/dictation_draft';
import type { DictationState } from '~/dictation/core/dictation_state';

const ANNOUNCED_STATUSES: ReadonlySet<DictationState['status']> = new Set([
	'recording',
	'finishing',
	'cleaning',
]);

export type StageDraft = {
	text: string;
	selection: DraftSelection;
	onTextChange: (text: string, selection: DraftSelection) => void;
	onSelectionChange: (selection: DraftSelection) => void;
	onCopy: (copiedText: string) => void;
};

type StageContentProps = {
	state: DictationState;
	draft: StageDraft;
};

export function StageContent({ state, draft }: Readonly<StageContentProps>) {
	const liveSegment = getLiveSegment(state);

	if (liveSegment === null) {
		return (
			<>
				<StageNotice state={state} />
				<DictationResult
					text={draft.text}
					selection={draft.selection}
					onTextChange={draft.onTextChange}
					onSelectionChange={draft.onSelectionChange}
					onCopy={draft.onCopy}
				/>
			</>
		);
	}

	const { textBefore, separatorBefore, separatorAfter, textAfter } = splitDraft(
		draft.text,
		draft.selection,
		liveSegment.committedText + liveSegment.partialText
	);

	return (
		<DictationTranscript
			textBefore={textBefore + separatorBefore}
			textAfter={separatorAfter + textAfter}
			committedText={liveSegment.committedText}
			partialText={liveSegment.partialText}
			hasPlaceholder={state.status !== 'cleaning'}
			hasCaret={state.status === 'recording'}
			isAnnounced={ANNOUNCED_STATUSES.has(state.status)}
			segmentClassName={state.status === 'cleaning' ? 'opacity-60' : undefined}
		/>
	);
}
