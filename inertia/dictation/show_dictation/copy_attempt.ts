export type CopyAttempt = {
	draftId: string;
	lastCopiedText: string | null;
	hasLastCopyFailed: boolean;
	copyCount: number;
};
