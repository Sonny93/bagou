import type {
	Message,
	MessageStreamParams,
} from '@anthropic-ai/sdk/resources/messages/messages';

import type {
	CleanupStream,
	MessagesApi,
} from '#text_cleanup/anthropic/anthropic_text_cleaner';

type FakeStreamOutcome = {
	snapshots?: readonly string[];
	result: Message | Error;
};

/** Records every request and replays canned text snapshots, then a message or error. */
export class FakeMessagesApi implements MessagesApi {
	readonly requests: MessageStreamParams[] = [];
	readonly signals: AbortSignal[] = [];
	private readonly snapshots: readonly string[];
	private readonly result: Message | Error;

	constructor(outcome: Message | Error | FakeStreamOutcome) {
		const isPlain = outcome instanceof Error || 'id' in outcome;
		this.snapshots = isPlain ? [] : (outcome.snapshots ?? []);
		this.result = isPlain ? outcome : outcome.result;
	}

	readonly messages = {
		stream: (
			params: MessageStreamParams,
			options: { signal: AbortSignal }
		): CleanupStream => {
			this.requests.push(params);
			this.signals.push(options.signal);
			return this.#createStream();
		},
	};

	#createStream(): CleanupStream {
		const listeners: ((delta: string, snapshot: string) => void)[] = [];
		const result = this.result;
		const snapshots = this.snapshots;
		return {
			on: (_event, listener) => {
				listeners.push(listener);
			},
			finalMessage: async () => {
				await Promise.resolve();
				for (const snapshot of snapshots) {
					for (const listener of listeners) listener('', snapshot);
				}
				if (result instanceof Error) throw result;
				return result;
			},
		};
	}
}
