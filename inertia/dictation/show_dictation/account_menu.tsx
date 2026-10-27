import { router } from '@inertiajs/react';
import { useLingui } from '@lingui/react/macro';
import { IconButton, Menu, MenuItem } from '@minimalstuff/ui';

import { urlFor } from '~/shared/lib/url_for';

export function AccountMenu() {
	const { t } = useLingui();
	const goToHistory = () =>
		router.visit(urlFor('transcription_history.show_transcripts'));
	const goToPasskeys = () => router.visit(urlFor('passkeys.show_passkeys'));
	const goToSettings = () =>
		router.visit(urlFor('user_settings.show_settings'));
	const logout = () => router.post(urlFor('auth.logout'));

	return (
		<Menu
			align="end"
			trigger={
				<IconButton
					icon="i-tabler-dots-vertical"
					aria-label={t`Account`}
					variant="ghost"
					tooltip
					size="sm"
				/>
			}
		>
			<MenuItem icon="i-tabler-history" onClick={goToHistory}>
				{t`History`}
			</MenuItem>
			<MenuItem icon="i-tabler-fingerprint" onClick={goToPasskeys}>
				{t`Passkeys`}
			</MenuItem>
			<MenuItem icon="i-tabler-settings" onClick={goToSettings}>
				{t`Settings`}
			</MenuItem>
			<MenuItem icon="i-tabler-logout" onClick={logout}>
				{t`Sign out`}
			</MenuItem>
		</Menu>
	);
}
