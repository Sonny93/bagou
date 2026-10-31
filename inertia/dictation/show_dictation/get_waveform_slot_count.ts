const BAR_WIDTH_PX = 2;
const BAR_GAP_PX = 2;

export const getWaveformSlotCount = (width: number): number =>
	Math.max(0, Math.floor((width + BAR_GAP_PX) / (BAR_WIDTH_PX + BAR_GAP_PX)));
