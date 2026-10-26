const PERCENT_FRACTION_DIGITS = 1;
const SECONDS_FRACTION_DIGITS = 1;
const NOT_AVAILABLE = 'n/a';

export function formatPercent(percent: number | undefined): string {
	return percent === undefined
		? NOT_AVAILABLE
		: `${percent.toFixed(PERCENT_FRACTION_DIGITS)} %`;
}

export function formatMilliseconds(milliseconds: number | undefined): string {
	return milliseconds === undefined
		? NOT_AVAILABLE
		: `${Math.round(milliseconds)} ms`;
}

export function formatSeconds(seconds: number): string {
	return `${seconds.toFixed(SECONDS_FRACTION_DIGITS)} s`;
}
