import type { Data } from '@generated/data';
import { IconButton } from '@minimalstuff/ui';

import { formatPasskeyDate } from '~/passkeys/show_passkeys/format_passkey_date';

type PasskeyRowProps = {
	passkey: Data.Passkey;
	onDelete: (passkey: Data.Passkey) => void;
};

export function PasskeyRow({ passkey, onDelete }: Readonly<PasskeyRowProps>) {
	const lastUsed = passkey.lastUsedAt
		? `utilisée le ${formatPasskeyDate(passkey.lastUsedAt)}`
		: 'jamais utilisée';

	const handleDelete = () => onDelete(passkey);

	return (
		<li className="flex items-center gap-3 px-4 py-3">
			<span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-100 text-accent-700 dark:bg-accent-950 dark:text-accent-300">
				<span className="i-tabler-fingerprint size-5" aria-hidden />
			</span>
			<div className="flex min-w-0 flex-1 flex-col">
				<span className="font-medium">{passkey.label}</span>
				<span className="text-sm text-muted">
					Créée le {formatPasskeyDate(passkey.createdAt)}, {lastUsed}
				</span>
			</div>
			<IconButton
				icon="i-tabler-trash"
				aria-label={`Supprimer la passkey ${passkey.label}`}
				variant="ghost"
				tooltip
				color="danger"
				onClick={handleDelete}
			/>
		</li>
	);
}
