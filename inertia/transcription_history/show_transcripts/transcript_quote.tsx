import { useLingui } from '@lingui/react/macro';

import { formatTranscriptDate } from './format_transcript_date';

type TranscriptQuoteProps = {
	text: string;
	createdAt: string;
};

export function TranscriptQuote({
	text,
	createdAt,
}: Readonly<TranscriptQuoteProps>) {
	const { i18n } = useLingui();

	return (
		<blockquote className="flex flex-col gap-1 border-l-2 border-line pl-3 text-sm text-muted">
			<span>{formatTranscriptDate(createdAt, i18n.locale)}</span>
			<p className="line-clamp-4 whitespace-pre-wrap">{text}</p>
		</blockquote>
	);
}
