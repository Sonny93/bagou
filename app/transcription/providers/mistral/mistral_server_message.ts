export type MistralServerMessage =
	| { type: 'session.created' }
	| { type: 'session.updated' }
	| { type: 'transcription.text.delta'; text: string }
	| { type: 'transcription.done'; text: string }
	| { type: 'error'; message: string }
	| { type: 'ignored' };
