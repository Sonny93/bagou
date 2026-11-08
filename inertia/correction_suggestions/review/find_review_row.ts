export const findReviewRow = (
	list: HTMLElement | null,
	key: string
): HTMLElement | null => {
	const rows = list?.querySelectorAll<HTMLElement>('[data-key]') ?? [];
	return [...rows].find((candidate) => candidate.dataset.key === key) ?? null;
};
