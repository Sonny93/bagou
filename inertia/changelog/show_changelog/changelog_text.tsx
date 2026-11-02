import { splitInlineCode } from '~/changelog/show_changelog/split_inline_code';

type ChangelogTextProps = {
	text: string;
};

export const ChangelogText = ({ text }: Readonly<ChangelogTextProps>) =>
	splitInlineCode(text).map(({ text: partText, isCode, offset }) =>
		isCode ? (
			<code
				key={offset}
				className="rounded bg-line/60 px-1 py-0.5 font-mono text-[0.9em]"
			>
				{partText}
			</code>
		) : (
			<span key={offset}>{partText}</span>
		)
	);
