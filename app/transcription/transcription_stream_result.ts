export type TranscriptionStreamResult = {
	text: string;
	timeToFirstFinalMs: number | undefined;
	finishLatencyMs: number;
};
