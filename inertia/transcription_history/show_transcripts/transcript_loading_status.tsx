import { Trans } from '@lingui/react/macro';

type TranscriptLoadingStatusProps = {
	loadingNext: boolean;
};

export const TranscriptLoadingStatus = ({
	loadingNext,
}: Readonly<TranscriptLoadingStatusProps>) => (
	<output className="flex justify-center pt-4 text-muted">
		{loadingNext && (
			<>
				<span
					aria-hidden="true"
					className="i-tabler-loader-2 size-5 animate-spin"
				/>
				<span className="sr-only">
					<Trans>Loading more dictations…</Trans>
				</span>
			</>
		)}
	</output>
);
