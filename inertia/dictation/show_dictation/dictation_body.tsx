import type { CopyStatus } from './copy_status';
import { DictationMessage } from './dictation_message';
import { DictationResult } from './dictation_result';
import { DictationTranscript } from './dictation_transcript';
import { RecordingIndicator } from './recording_indicator';
import { StartDictationButton } from './start_dictation_button';
import type { DictationState } from '~/dictation/core/dictation_state';

type DictationBodyProps = {
	state: DictationState;
	level: number;
	onStart: () => void;
	copyStatus: CopyStatus;
	onCopy: (text: string) => void;
};

export function DictationBody({
	state,
	level,
	onStart,
	copyStatus,
	onCopy,
}: Readonly<DictationBodyProps>) {
	switch (state.status) {
		case 'idle':
			return <StartDictationButton onStart={onStart} />;
		case 'connecting':
			return <DictationMessage text="Connexion…" />;
		case 'recording':
			return (
				<div className="flex flex-col gap-4">
					<RecordingIndicator startedAt={state.startedAt} level={level} />
					<DictationTranscript
						committedText={state.committedText}
						partialText={state.partialText}
					/>
				</div>
			);
		case 'finishing':
			return (
				<div className="flex flex-col gap-4">
					<DictationMessage text="Finalisation…" />
					<DictationTranscript
						committedText={state.committedText}
						partialText={state.partialText}
					/>
				</div>
			);
		case 'cleaning':
			return (
				<div className="flex flex-col gap-4">
					<DictationMessage text="Nettoyage…" />
					<DictationTranscript
						committedText={state.rawText}
						partialText=""
						className="opacity-50"
					/>
				</div>
			);
		case 'done':
			return (
				<DictationResult
					text={state.text}
					isCleaned={state.isCleaned}
					copyStatus={copyStatus}
					onCopy={onCopy}
				/>
			);
		case 'cancelled':
			return <DictationMessage text="Dictée annulée" />;
		case 'error':
			return <DictationMessage text={state.message} isError />;
	}
}
