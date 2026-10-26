export function describeDeletionCount(count: number): string {
	return count === 1
		? '1 dictée sera supprimée définitivement.'
		: `${count} dictées seront supprimées définitivement.`;
}
