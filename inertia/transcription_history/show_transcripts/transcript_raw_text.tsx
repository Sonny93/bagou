import { Trans } from '@lingui/react/macro';

type TranscriptRawTextProps = {
	rawText: string;
};

export const TranscriptRawText = ({
	rawText,
}: Readonly<TranscriptRawTextProps>) => (
	<details className="text-sm text-muted">
		<summary className="cursor-pointer select-none">
			<Trans>Raw text</Trans>
		</summary>
		<p className="mt-2 whitespace-pre-wrap">{rawText}</p>
	</details>
);
