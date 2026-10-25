const SECONDS_PER_MINUTE = 60;

export function formatElapsedTime(elapsedMilliseconds: number): string {
	const totalSeconds = Math.floor(elapsedMilliseconds / 1000);
	const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
	const seconds = totalSeconds % SECONDS_PER_MINUTE;
	return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
