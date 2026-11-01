export type CopyAttempt = {
	draftId: string;
	copiedText: string | null;
	draftTextAtCopy: string | null;
	hasLastCopyFailed: boolean;
	copyCount: number;
};
