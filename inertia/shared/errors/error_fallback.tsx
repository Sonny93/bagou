import { Trans } from '@lingui/react/macro';
import { Button } from '@minimalstuff/ui';

type ErrorFallbackProps = {
	onReload: () => void;
};

export const ErrorFallback = ({ onReload }: Readonly<ErrorFallbackProps>) => (
	<div
		role="alert"
		className="mx-auto flex min-h-60 max-w-md flex-col items-center justify-center gap-4 px-4 text-center"
	>
		<span className="i-tabler-alert-triangle size-8 text-muted" aria-hidden />
		<p className="text-ink">
			<Trans>Something went wrong while displaying this page</Trans>
		</p>
		<Button type="button" onClick={onReload}>
			<Trans>Reload</Trans>
		</Button>
	</div>
);
