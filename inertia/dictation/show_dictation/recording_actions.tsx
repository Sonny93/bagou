import { Button, Kbd } from '@minimalstuff/ui';

type RecordingActionsProps = {
	onCancel: () => void;
};

export const RecordingActions = ({
	onCancel,
}: Readonly<RecordingActionsProps>) => (
	<Button variant="ghost" onClick={onCancel}>
		Annuler <Kbd>Échap</Kbd>
	</Button>
);
