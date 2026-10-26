type TranscriptRawTextProps = {
	rawText: string;
};

export const TranscriptRawText = ({
	rawText,
}: Readonly<TranscriptRawTextProps>) => (
	<details className="text-sm text-muted">
		<summary className="cursor-pointer select-none">Texte brut</summary>
		<p className="mt-2 whitespace-pre-wrap">{rawText}</p>
	</details>
);
