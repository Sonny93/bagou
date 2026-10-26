import type {
	Message,
	MessageCreateParamsNonStreaming,
} from '@anthropic-ai/sdk/resources/messages';

import type { MessagesApi } from '#text_cleanup/anthropic/anthropic_text_cleaner';

/** Records every request and answers with a canned message or error. */
export class FakeMessagesApi implements MessagesApi {
	readonly requests: MessageCreateParamsNonStreaming[] = [];

	constructor(private readonly outcome: Message | Error) {}

	readonly messages = {
		create: async (
			params: MessageCreateParamsNonStreaming
		): Promise<Message> => {
			this.requests.push(params);
			if (this.outcome instanceof Error) throw this.outcome;
			return this.outcome;
		},
	};
}
