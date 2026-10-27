import { Trans } from '@lingui/react/macro';

export const SavedStatus = () => (
	<output className="flex items-center gap-1.5 text-sm text-muted">
		<span className="i-tabler-check size-4" aria-hidden />
		<Trans>Settings saved</Trans>
	</output>
);
