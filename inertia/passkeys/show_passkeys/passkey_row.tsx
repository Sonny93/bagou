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
		<li className="flex items-center justify-between gap-4 py-3">
			<div className="flex flex-col">
				<span className="font-medium">{passkey.label}</span>
				<span className="text-sm text-gray-600 dark:text-gray-300">
					Créée le {formatPasskeyDate(passkey.createdAt)}, {lastUsed}
				</span>
			</div>
			<IconButton
				icon="i-tabler-trash"
				aria-label={`Supprimer la passkey ${passkey.label}`}
				variant="ghost"
				color="danger"
				onClick={handleDelete}
			/>
		</li>
	);
}
