/** Appends `level` and keeps only the newest `capacity` levels. */
export function appendLevel(
	levels: readonly number[],
	level: number,
	capacity: number
): readonly number[] {
	return [...levels, level].slice(-capacity);
}
