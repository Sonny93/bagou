import { formatElapsedTime } from './format_elapsed_time';
import { LevelWaveform } from './level_waveform';
import { useElapsedTime } from './use_elapsed_time';

type RecordingStatusProps = {
	startedAt: number;
	levels: readonly number[];
};

export function RecordingStatus({
	startedAt,
	levels,
}: Readonly<RecordingStatusProps>) {
	const elapsed = useElapsedTime(startedAt);

	return (
		<div className="flex min-w-0 items-center gap-3 text-sm">
			<span
				className="size-2.5 shrink-0 animate-pulse rounded-full bg-signal motion-reduce:animate-none"
				aria-hidden
			/>
			<time className="shrink-0 tabular-nums">
				{formatElapsedTime(elapsed)}
			</time>
			<LevelWaveform levels={levels} />
		</div>
	);
}
