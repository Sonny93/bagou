import { Link } from '@adonisjs/inertia/react';
import { Trans } from '@lingui/react/macro';
import { Button, buttonClassName } from '@minimalstuff/ui';
import type { RefObject } from 'react';

import { urlFor } from '~/shared/lib/url_for';

type ReviewDrawerFooterProps = {
	closeButtonRef: RefObject<HTMLButtonElement | null>;
	onClose: () => void;
};

export const ReviewDrawerFooter = ({
	closeButtonRef,
	onClose,
}: Readonly<ReviewDrawerFooterProps>) => (
	<div className="flex items-center justify-between gap-3 px-6 py-4">
		<Link
			href={`${urlFor('user_settings.show_settings')}#corrections`}
			className={buttonClassName({ variant: 'ghost', size: 'sm' })}
		>
			<Trans>Manage in settings</Trans>
		</Link>
		<Button ref={closeButtonRef} size="sm" variant="outline" onClick={onClose}>
			<Trans>Close</Trans>
		</Button>
	</div>
);
