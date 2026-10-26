import { Button, Kbd } from '@minimalstuff/ui';

type NewDictationButtonProps = {
	onStart: () => void;
};

export const NewDictationButton = ({
	onStart,
}: Readonly<NewDictationButtonProps>) => (
	<Button variant="ghost" onClick={onStart}>
		Nouvelle dictée <Kbd>N</Kbd>
	</Button>
);
