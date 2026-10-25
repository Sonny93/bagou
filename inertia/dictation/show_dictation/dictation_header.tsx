import { Link } from '@adonisjs/inertia/react';
import { Switch } from '@minimalstuff/ui';

const HEADER_LINK_CLASSES =
	'inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:text-gray-300 dark:hover:text-white';

type DictationHeaderProps = {
	isAutoStartEnabled: boolean;
	onAutoStartChange: (isEnabled: boolean) => void;
};

export function DictationHeader({
	isAutoStartEnabled,
	onAutoStartChange,
}: Readonly<DictationHeaderProps>) {
	const handleAutoStartChange = (event: React.ChangeEvent<HTMLInputElement>) =>
		onAutoStartChange(event.target.checked);

	return (
		<header className="flex items-center justify-between gap-4">
			<Switch
				label="Démarrer automatiquement"
				description="Sur cet appareil"
				checked={isAutoStartEnabled}
				onChange={handleAutoStartChange}
			/>
			<nav className="flex items-center gap-4">
				<Link route="passkeys.show_passkeys" className={HEADER_LINK_CLASSES}>
					<span className="i-tabler-fingerprint size-4" aria-hidden />
					Passkeys
				</Link>
				<Link
					route="auth.logout"
					method="post"
					as="button"
					className={HEADER_LINK_CLASSES}
				>
					<span className="i-tabler-logout size-4" aria-hidden />
					Déconnexion
				</Link>
			</nav>
		</header>
	);
}
