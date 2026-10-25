import { formatElapsedTime } from './format_elapsed_time';
import { LevelMeter } from './level_meter';
import { useElapsedTime } from './use_elapsed_time';

type RecordingIndicatorProps = {
	startedAt: number;
	level: number;
};

export function RecordingIndicator({
	startedAt,
	level,
}: Readonly<RecordingIndicatorProps>) {
	const elapsed = useElapsedTime(startedAt);

	return (
		<div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200">
			<span
				className="size-3 animate-pulse rounded-full bg-red-500"
				aria-hidden
			/>
			<span>Enregistrement</span>
			<time className="tabular-nums">{formatElapsedTime(elapsed)}</time>
			<LevelMeter level={level} />
		</div>
	);
}
