import { Button, Kbd } from '@minimalstuff/ui';

type RecordingActionsProps = {
	onFinish: () => void;
	onCancel: () => void;
};

export const RecordingActions = ({
	onFinish,
	onCancel,
}: Readonly<RecordingActionsProps>) => (
	<div className="flex items-center gap-1">
		<Button variant="ghost" onClick={onFinish}>
			Terminer <Kbd>Entrée</Kbd>
		</Button>
		<Button variant="ghost" onClick={onCancel}>
			Annuler <Kbd>Échap</Kbd>
		</Button>
	</div>
);
