import { getWaveformSlotCount } from '~/dictation/show_dictation/get_waveform_slot_count';
import { getWaveformSlots } from '~/dictation/show_dictation/get_waveform_slots';
import { useElementWidth } from '~/dictation/show_dictation/use_element_width';

const LEVEL_GAIN = 4;
const MIN_BAR_SCALE = 0.08;

type LevelWaveformProps = {
	levels: readonly number[];
};

const toBarScale = (level: number): number =>
	Math.max(MIN_BAR_SCALE, Math.min(1, level * LEVEL_GAIN));

export function LevelWaveform({ levels }: Readonly<LevelWaveformProps>) {
	const { ref, width } = useElementWidth();
	const slots = getWaveformSlots(levels, getWaveformSlotCount(width));

	return (
		<div
			ref={ref}
			role="presentation"
			aria-hidden
			className="flex h-6 min-w-0 flex-1 items-center justify-end gap-0.5 overflow-hidden"
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
