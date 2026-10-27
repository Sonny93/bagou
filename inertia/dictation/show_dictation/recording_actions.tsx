import { Trans } from '@lingui/react/macro';
import { Button, Kbd } from '@minimalstuff/ui';

type RecordingActionsProps = {
	onCancel: () => void;
};

export const RecordingActions = ({
	onCancel,
}: Readonly<RecordingActionsProps>) => (
	<Button variant="ghost" onClick={onCancel}>
		<Trans>Cancel</Trans>{' '}
		<Kbd className="hidden sm:inline-flex">
			<Trans>Esc</Trans>
		</Kbd>
	</Button>
);
