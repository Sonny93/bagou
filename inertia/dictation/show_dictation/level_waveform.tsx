import { LEVEL_HISTORY_CAPACITY } from './level_history_capacity';

const LEVEL_GAIN = 4;
const MIN_BAR_SCALE = 0.08;

type LevelWaveformProps = {
	levels: readonly number[];
};

const toBarScale = (level: number): number =>
	Math.max(MIN_BAR_SCALE, Math.min(1, level * LEVEL_GAIN));

export function LevelWaveform({ levels }: Readonly<LevelWaveformProps>) {
	const silentSlotCount = Math.max(0, LEVEL_HISTORY_CAPACITY - levels.length);
	const slots = [...Array<number>(silentSlotCount).fill(0), ...levels];

	return (
		<div
			role="presentation"
			aria-hidden
			className="flex h-6 min-w-0 items-center justify-end gap-0.5 overflow-hidden"
		>
			{slots.map((level, slotIndex) => (
				<span
					key={slotIndex}
					className="h-full w-0.5 shrink-0 rounded-full bg-signal transition-transform duration-100 ease-linear motion-reduce:transition-none"
					style={{ transform: `scaleY(${toBarScale(level)})` }}
				/>
			))}
		</div>
	);
}
