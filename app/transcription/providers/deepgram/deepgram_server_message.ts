export type DeepgramServerMessage =
	| { type: 'results'; isFinal: boolean; transcript: string }
	| { type: 'metadata' }
	| { type: 'configureSuccess' }
	| { type: 'configureFailure'; code: string }
	| { type: 'error'; reason: string }
	| { type: 'ignored' };
