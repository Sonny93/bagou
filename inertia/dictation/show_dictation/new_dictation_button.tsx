import { Trans } from '@lingui/react/macro';
import { Button, Kbd } from '@minimalstuff/ui';

type NewDictationButtonProps = {
	onStart: () => void;
};

export const NewDictationButton = ({
	onStart,
}: Readonly<NewDictationButtonProps>) => (
	<Button variant="ghost" onClick={onStart}>
		<Trans>
			New<span className="hidden sm:inline"> dictation</span>
		</Trans>{' '}
		<Kbd className="hidden sm:inline-flex">N</Kbd>
	</Button>
);
