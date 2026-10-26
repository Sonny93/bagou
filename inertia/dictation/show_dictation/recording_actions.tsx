import { Button, Kbd } from '@minimalstuff/ui';

type RecordingActionsProps = {
	onCancel: () => void;
};

export const RecordingActions = ({
	onCancel,
}: Readonly<RecordingActionsProps>) => (
	<Button variant="ghost" onClick={onCancel}>
		Annuler <Kbd className="hidden sm:inline-flex">Échap</Kbd>
	</Button>
);
