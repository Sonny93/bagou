export const getWaveformSlots = (
	levels: readonly number[],
	slotCount: number
): readonly number[] => {
	if (slotCount <= 0) return [];

	const newestLevels = levels.slice(-slotCount);
	const silentSlotCount = slotCount - newestLevels.length;

	return [...Array<number>(silentSlotCount).fill(0), ...newestLevels];
};
