import type { CleanupQuality } from '~/shared/cleanup_quality';

export type QualityEntries<TValue> = Readonly<
	Partial<Record<CleanupQuality, TValue>>
>;

/** Sets the entry of a quality, or removes it when the value is `null`; the other qualities are untouched. */
export function updateQualityEntries<TValue>(
	entries: QualityEntries<TValue>,
	quality: CleanupQuality,
	value: TValue | null
): QualityEntries<TValue> {
	if (value === null) {
		const { [quality]: _removed, ...remaining } = entries;
		return remaining;
	}
	return { ...entries, [quality]: value };
}
