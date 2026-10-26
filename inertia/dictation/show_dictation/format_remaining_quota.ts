/** French wording of the minutes of dictation left today. */
export function formatRemainingQuota(remainingMinutes: number): string {
	if (remainingMinutes <= 0) return 'Quota du jour atteint';
	return `Reste ${remainingMinutes} min aujourd'hui`;
}
