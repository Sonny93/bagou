import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';

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
	connecting: msg`Connecting…`,
	finishing: msg`Finishing…`,
	cleaning: msg`Cleaning the text…`,
} as const satisfies Partial<Record<DictationState['status'], unknown>>;

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
	const { i18n } = useLingui();
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
		<p className="truncate text-sm text-muted">
			{formatRemainingQuota(remainingMinutes, i18n)}
		</p>
	);

	const renderCopyControls = (isCleaned: boolean) => (
		<CopyControls
			copyStatus={copyStatus}
			isCleaned={isCleaned}
			onCopy={onCopy}
		/>
	);
	const idleStatus = hasDraftText ? renderCopyControls(true) : quota;

	switch (state.status) {
		case 'connecting':
		case 'finishing':
		case 'cleaning':
			return (
				<DockLayout
					mic={mic}
					status={<BusyStatus label={i18n._(BUSY_LABELS[state.status])} />}
				/>
			);
		case 'idle':
			return <DockLayout mic={mic} status={idleStatus} />;
		case 'cancelled':
		case 'error':
			return (
				<DockLayout
					mic={mic}
					status={idleStatus}
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
					status={hasDraftText ? renderCopyControls(state.isCleaned) : quota}
					end={<NewDictationButton onStart={onStartNew} />}
				/>
			);
	}
}
