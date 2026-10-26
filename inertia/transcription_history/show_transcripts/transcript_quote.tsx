import { formatTranscriptDate } from './format_transcript_date';

type TranscriptQuoteProps = {
	text: string;
	createdAt: string;
};

export const TranscriptQuote = ({
	text,
	createdAt,
}: Readonly<TranscriptQuoteProps>) => (
	<blockquote className="flex flex-col gap-1 border-l-2 border-line pl-3 text-sm text-muted">
		<span>{formatTranscriptDate(createdAt)}</span>
		<p className="line-clamp-4 whitespace-pre-wrap">{text}</p>
	</blockquote>
);
