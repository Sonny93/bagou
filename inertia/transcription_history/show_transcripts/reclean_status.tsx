import { useLingui } from '@lingui/react/macro';
import { Spinner } from '@minimalstuff/ui';

type RecleanStatusProps = {
	isRunning: boolean;
	errorMessage: string | null;
	announcement: string;
};

export function RecleanStatus({
	isRunning,
	errorMessage,
	announcement,
}: Readonly<RecleanStatusProps>) {
	const { t } = useLingui();

	return (
		<>
			{isRunning && (
				<Spinner size="sm" label={t`Cleaning again from the raw text…`} />
			)}
			{errorMessage !== null && (
				<p className="text-sm text-signal">{errorMessage}</p>
			)}
			<output className="sr-only">{announcement}</output>
		</>
	);
}
