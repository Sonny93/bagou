import { TextCleaner } from '#text_cleanup/text_cleaner';

/** Upper-cases the text, or fails when given an error. */
export class FakeTextCleaner extends TextCleaner {
	readonly cleaned: string[] = [];

	constructor(private readonly failure?: Error) {
		super();
	}

	async clean(text: string): Promise<string> {
		this.cleaned.push(text);
		if (this.failure) throw this.failure;
		return text.toUpperCase();
	}
}
