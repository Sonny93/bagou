import type { Data } from '@generated/data';
import { router } from '@inertiajs/react';
import { useLingui } from '@lingui/react/macro';
import { ConfirmModal } from '@minimalstuff/ui';

import { urlFor } from '~/shared/lib/url_for';

export function useDeletePasskey(): (passkey: Data.Passkey) => void {
	const { t } = useLingui();

	const confirmAndDelete = async (passkey: Data.Passkey): Promise<void> => {
		const { label } = passkey;
		const isConfirmed = await ConfirmModal.call({
			title: t`Delete the passkey ${label}?`,
			confirmLabel: t`Delete`,
			confirmColor: 'danger',
		});
		if (!isConfirmed) return;
		router.delete(urlFor('passkeys.delete_passkey', { id: passkey.id }));
	};

	return (passkey) => {
		void confirmAndDelete(passkey);
	};
}
