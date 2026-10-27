import type { Data } from '@generated/data';
import { useLingui } from '@lingui/react/macro';
import { IconButton } from '@minimalstuff/ui';

import { formatPasskeyDate } from '~/passkeys/show_passkeys/format_passkey_date';

type PasskeyRowProps = {
	passkey: Data.Passkey;
	onDelete: (passkey: Data.Passkey) => void;
};

export function PasskeyRow({ passkey, onDelete }: Readonly<PasskeyRowProps>) {
	const { t, i18n } = useLingui();
	const createdDate = formatPasskeyDate(passkey.createdAt, i18n.locale);
	const { label, lastUsedAt } = passkey;
	const lastUsedDate = lastUsedAt
		? formatPasskeyDate(lastUsedAt, i18n.locale)
		: null;
	const usage =
		lastUsedDate === null
			? t`Created on ${createdDate}, never used`
			: t`Created on ${createdDate}, used on ${lastUsedDate}`;

	const handleDelete = () => onDelete(passkey);

	return (
		<li className="flex items-center gap-3 px-4 py-3">
			<span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-100 text-accent-700 dark:bg-accent-950 dark:text-accent-300">
				<span className="i-tabler-fingerprint size-5" aria-hidden />
			</span>
			<div className="flex min-w-0 flex-1 flex-col">
				<span className="font-medium">{label}</span>
				<span className="text-sm text-muted">{usage}</span>
			</div>
			<IconButton
				icon="i-tabler-trash"
				aria-label={t`Delete the passkey ${label}`}
				variant="ghost"
				tooltip
				color="danger"
				onClick={handleDelete}
			/>
		</li>
	);
}
