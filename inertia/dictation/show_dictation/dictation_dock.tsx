import { BusyStatus } from './busy_status';
import { CopyControls } from './copy_controls';
import type { CopyStatus } from './copy_status';
import { DockLayout } from './dock_layout';
import { formatRemainingQuota } from './format_remaining_quota';
import { MicButton } from './mic_button';
import { NewDictationButton } from './new_dictation_button';
import { RecordingActions } from './recording_actions';
import { RecordingStatus } from './recording_status';
import type { DictationState } from '~/dictation/core/dictation_state';

type DictationDockProps = {
	state: DictationState;
	levels: readonly number[];
	remainingMinutes: number;
	hasDraftText: boolean;
	copyStatus: CopyStatus;
	onCopy: () => void;
	onStart: () => void;
	onStartNew: () => void;
	onFinish: () => void;
	onCancel: () => void;
};

const BUSY_LABELS = {
	connecting: 'Connexion…',
	finishing: 'Finalisation…',
	cleaning: 'Nettoyage du texte…',
} as const satisfies Partial<Record<DictationState['status'], string>>;

export function DictationDock({
	state,
	levels,
	remainingMinutes,
	hasDraftText,
	copyStatus,
	onCopy,
	onStart,
	onStartNew,
	onFinish,
	onCancel,
}: Readonly<DictationDockProps>) {
	const mic = (
		<MicButton
			isRecording={state.status === 'recording'}
			isBusy={state.status in BUSY_LABELS}
			hasDraftText={hasDraftText}
			onStart={onStart}
			onFinish={onFinish}
		/>
	);
	const quota = (
		<p className="text-sm text-muted">
			{formatRemainingQuota(remainingMinutes)}
		</p>
	);

	switch (state.status) {
		case 'connecting':
		case 'finishing':
		case 'cleaning':
			return (
				<DockLayout
					mic={mic}
					status={<BusyStatus label={BUSY_LABELS[state.status]} />}
				/>
			);
		case 'idle':
			return <DockLayout mic={mic} status={quota} />;
		case 'cancelled':
		case 'error':
			return (
				<DockLayout
					mic={mic}
					status={quota}
					end={<NewDictationButton onStart={onStartNew} />}
				/>
			);
		case 'recording':
			return (
				<DockLayout
					mic={mic}
					status={
						<RecordingStatus startedAt={state.startedAt} levels={levels} />
					}
					end={<RecordingActions onCancel={onCancel} />}
				/>
			);
		case 'done':
			return (
				<DockLayout
					mic={mic}
					status={
						<CopyControls
							copyStatus={copyStatus}
							isCleaned={state.isCleaned}
							onCopy={onCopy}
						/>
					}
					end={<NewDictationButton onStart={onStartNew} />}
				/>
			);
	}
}
