import { Plural } from '@lingui/react/macro';

type BeyondSpeechLimitWarningProps = {
	count: number;
};

export const BeyondSpeechLimitWarning = ({
	count,
}: Readonly<BeyondSpeechLimitWarningProps>) => (
	<p className="flex items-start gap-2 rounded-md border border-line p-3 text-sm">
		<span
			className="i-tabler-alert-triangle mt-0.5 size-4 shrink-0"
			aria-hidden
		/>
		<span>
			<Plural
				value={count}
				one="# corrected word no longer reaches speech recognition, only the cleanup."
				other="# corrected words no longer reach speech recognition, only the cleanup."
			/>
		</span>
	</p>
);
