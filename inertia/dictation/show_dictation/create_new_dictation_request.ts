type NewDictationRequestOptions = {
	isUnsaved: boolean;
	confirm: () => Promise<boolean>;
	startNew: () => void;
};

export type NewDictationRequester = {
	request: (options: Readonly<NewDictationRequestOptions>) => Promise<void>;
};

/**
 * Starts a new dictation, after a confirmation when the draft may not be in
 * the history. While a confirmation is open, further requests do nothing, so
 * repeated key presses never stack modals.
 */
export function createNewDictationRequester(): NewDictationRequester {
	let isAsking = false;

	const request = async ({
		isUnsaved,
		confirm,
		startNew,
	}: Readonly<NewDictationRequestOptions>): Promise<void> => {
		if (isAsking) return;
		if (!isUnsaved) return startNew();
		isAsking = true;
		try {
			if (await confirm()) startNew();
		} finally {
			isAsking = false;
		}
	};

	return { request };
}
