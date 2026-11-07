import { Link } from '@adonisjs/inertia/react';
import { Trans } from '@lingui/react/macro';
import { buttonClassName } from '@minimalstuff/ui';

export const BackToDictationLink = () => (
	<Link
		route="dictation.show_dictation"
		className={buttonClassName({
			variant: 'ghost',
			size: 'sm',
			className: 'gap-1.5',
		})}
	>
		<span className="i-tabler-arrow-left size-4" aria-hidden />
		<Trans>Dictation</Trans>
	</Link>
);
