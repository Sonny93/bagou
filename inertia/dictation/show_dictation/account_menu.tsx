import { router } from '@inertiajs/react';
import { IconButton, Menu, MenuItem } from '@minimalstuff/ui';

import { urlFor } from '~/shared/lib/url_for';

export function AccountMenu() {
	const goToHistory = () =>
		router.visit(urlFor('transcription_history.show_transcripts'));
	const goToPasskeys = () => router.visit(urlFor('passkeys.show_passkeys'));
	const logout = () => router.post(urlFor('auth.logout'));

	return (
		<Menu
			align="end"
			trigger={
				<IconButton
					icon="i-tabler-dots-vertical"
					aria-label="Compte"
					variant="ghost"
					tooltip
					size="sm"
				/>
			}
		>
			<MenuItem icon="i-tabler-history" onClick={goToHistory}>
				Historique
			</MenuItem>
			<MenuItem icon="i-tabler-fingerprint" onClick={goToPasskeys}>
				Passkeys
			</MenuItem>
			<MenuItem icon="i-tabler-logout" onClick={logout}>
				Déconnexion
			</MenuItem>
		</Menu>
	);
}
