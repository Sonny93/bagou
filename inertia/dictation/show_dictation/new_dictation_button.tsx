import { Button, Kbd } from '@minimalstuff/ui';

type NewDictationButtonProps = {
	onStart: () => void;
};

export const NewDictationButton = ({
	onStart,
}: Readonly<NewDictationButtonProps>) => (
	<Button variant="ghost" onClick={onStart}>
		Nouvelle<span className="hidden sm:inline"> dictée</span>{' '}
		<Kbd className="hidden sm:inline-flex">N</Kbd>
	</Button>
);
