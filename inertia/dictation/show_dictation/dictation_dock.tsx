import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { useRef } from 'react';

import { BusyStatus } from './busy_status';
import { CopyControls } from './copy_controls';
import type { CopyStatus } from './copy_status';
import { DockLayout } from './dock_layout';
import { formatRemainingQuota } from './format_remaining_quota';
import { MicButton } from './mic_button';
import { RecordingActions } from './recording_actions';
import { RecordingStatus } from './recording_status';
import { useFocusAfterClean } from './use_focus_after_clean';
import type { DictationState } from '~/dictation/core/dictation_state';

type DictationDockProps = {
	state: DictationState;
	levels: readonly number[];
	remainingMinutes: number;
	hasDraftText: boolean;
	copyStatus: CopyStatus;
	copyCount: number;
	onCopy: () => void;
	onStart: () => void;
	onFinish: () => void;
	onCancel: () => void;
	onCleanDraft: () => void;
};

const BUSY_LABELS = {
	connecting: msg`Connecting…`,
	finishing: msg`Finishing…`,
	cleaning: msg`Cleaning the text…`,
	recleaning: msg`Cleaning the text…`,
} as const satisfies Partial<Record<DictationState['status'], unknown>>;

export function DictationDock({
	state,
	levels,
	remainingMinutes,
	hasDraftText,
	copyStatus,
	copyCount,
	onCopy,
	onStart,
	onFinish,
	onCancel,
	onCleanDraft,
}: Readonly<DictationDockProps>) {
	const { i18n } = useLingui();
	const copyButtonRef = useRef<HTMLButtonElement>(null);
	useFocusAfterClean(state.status, copyButtonRef);
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
			isCleaningDraft={state.status === 'recleaning'}
			copyCount={copyCount}
			isCleaned={isCleaned}
			copyButtonRef={copyButtonRef}
			onCopy={onCopy}
			onCleanDraft={onCleanDraft}
		/>
	);
	const idleStatus = hasDraftText ? renderCopyControls(true) : quota;

	switch (state.status) {
		case 'recleaning':
			return <DockLayout mic={mic} status={renderCopyControls(true)} />;
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
			return <DockLayout mic={mic} status={idleStatus} />;
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
				/>
			);
	}
}
