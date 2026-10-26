import { BusyStatus } from './busy_status';
import { CopyControls } from './copy_controls';
import type { CopyStatus } from './copy_status';
import { formatRemainingQuota } from './format_remaining_quota';
import { NewDictationButton } from './new_dictation_button';
import { RecordingActions } from './recording_actions';
import { RecordingStatus } from './recording_status';
import type { DictationState } from '~/dictation/core/dictation_state';

type DictationDockProps = {
	state: DictationState;
	levels: readonly number[];
	remainingMinutes: number;
	copyStatus: CopyStatus;
	onCopy: () => void;
	onStart: () => void;
	onFinish: () => void;
	onCancel: () => void;
};

type DockLayoutProps = {
	start: React.ReactNode;
	end?: React.ReactNode;
};

const DockLayout = ({ start, end }: Readonly<DockLayoutProps>) => (
	<footer className="shrink-0 border-t border-line bg-surface">
		<div className="mx-auto flex min-h-16 w-full max-w-3xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2 sm:px-6">
			{start}
			{end}
		</div>
	</footer>
);

export function DictationDock({
	state,
	levels,
	remainingMinutes,
	copyStatus,
	onCopy,
	onStart,
	onFinish,
	onCancel,
}: Readonly<DictationDockProps>) {
	const quota = (
		<p className="text-sm text-muted">
			{formatRemainingQuota(remainingMinutes)}
		</p>
	);

	switch (state.status) {
		case 'idle':
			return <DockLayout start={quota} />;
		case 'cancelled':
		case 'error':
			return (
				<DockLayout
					start={quota}
					end={<NewDictationButton onStart={onStart} />}
				/>
			);
		case 'connecting':
			return <DockLayout start={<BusyStatus label="Connexion…" />} />;
		case 'recording':
			return (
				<DockLayout
					start={
						<RecordingStatus startedAt={state.startedAt} levels={levels} />
					}
					end={<RecordingActions onFinish={onFinish} onCancel={onCancel} />}
				/>
			);
		case 'finishing':
			return <DockLayout start={<BusyStatus label="Finalisation…" />} />;
		case 'cleaning':
			return <DockLayout start={<BusyStatus label="Nettoyage du texte…" />} />;
		case 'done':
			return (
				<DockLayout
					start={
						<CopyControls
							copyStatus={copyStatus}
							isCleaned={state.isCleaned}
							onCopy={onCopy}
						/>
					}
					end={<NewDictationButton onStart={onStart} />}
				/>
			);
	}
}
