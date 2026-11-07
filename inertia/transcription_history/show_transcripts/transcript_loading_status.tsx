import { useLingui } from '@lingui/react/macro';
import { Spinner } from '@minimalstuff/ui';

type TranscriptLoadingStatusProps = {
	loadingNext: boolean;
};

export function TranscriptLoadingStatus({
	loadingNext,
}: Readonly<TranscriptLoadingStatusProps>) {
	const { t } = useLingui();

	return (
		<output className="flex justify-center pt-4 text-muted">
			{loadingNext && (
				<Spinner
					role="none"
					label={t`Loading more dictations…`}
					labelClassName="sr-only"
				/>
			)}
		</output>
	);
}
