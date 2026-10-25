import { Link } from '@adonisjs/inertia/react';

const HEADER_LINK_CLASSES =
	'inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:text-gray-300 dark:hover:text-white';

export const DictationHeader = () => (
	<header className="flex items-center justify-end gap-4">
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
	</header>
);
