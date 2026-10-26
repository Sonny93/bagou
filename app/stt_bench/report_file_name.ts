const PAD_LENGTH = 2;

const pad = (value: number): string => String(value).padStart(PAD_LENGTH, '0');

/** `YYYY-MM-DD-HHmm-<provider>.md`, in local time. */
export function buildReportFileName(
	generatedAt: Date,
	providerName: string
): string {
	const day = [
		generatedAt.getFullYear(),
		pad(generatedAt.getMonth() + 1),
		pad(generatedAt.getDate()),
	].join('-');
	const time = `${pad(generatedAt.getHours())}${pad(generatedAt.getMinutes())}`;
	return `${day}-${time}-${providerName}.md`;
}
