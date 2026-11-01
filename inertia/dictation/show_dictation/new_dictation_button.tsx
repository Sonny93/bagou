import { Trans, useLingui } from '@lingui/react/macro';
import { Button, Kbd } from '@minimalstuff/ui';

type NewDictationButtonProps = {
	isAvailable: boolean;
	onStart: () => void;
};

/**
 * Stays focusable while unavailable (`aria-disabled`), so focus never drops
 * when a dictation starts from it.
 */
export function NewDictationButton({
	isAvailable,
	onStart,
}: Readonly<NewDictationButtonProps>) {
	const { t } = useLingui();

	return (
		<Button
			variant="ghost"
			className="shrink-0 whitespace-nowrap [&[aria-disabled=true]>*]:opacity-60"
			title={t`New dictation`}
			aria-keyshortcuts="N"
			aria-disabled={!isAvailable}
			onClick={isAvailable ? onStart : undefined}
		>
			<Trans>New dictation</Trans>{' '}
			<span className="hidden sm:inline-flex" aria-hidden>
				<Kbd>N</Kbd>
			</span>
		</Button>
	);
}
