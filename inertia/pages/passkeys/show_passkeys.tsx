import { Link } from '@adonisjs/inertia/react';
import type { Data } from '@generated/data';
import { Card } from '@minimalstuff/ui';

import { AddPasskeyForm } from '~/passkeys/show_passkeys/add_passkey_form';
import { PasskeyRow } from '~/passkeys/show_passkeys/passkey_row';
import { useDeletePasskey } from '~/passkeys/show_passkeys/use_delete_passkey';

type ShowPasskeysProps = {
	passkeys: Data.Passkey[];
};

export default function ShowPasskeys({
	passkeys,
}: Readonly<ShowPasskeysProps>) {
	const deletePasskey = useDeletePasskey();

	return (
		<main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 bg-gray-50 p-6 dark:bg-gray-800">
			<Link route="dictation.show_dictation" className="text-sm underline">
				Retour à la dictée
			</Link>
			<Card title="Passkeys" padding="lg">
				<ul className="divide-y divide-gray-200 dark:divide-gray-700">
					{passkeys.map((passkey) => (
						<PasskeyRow
							key={passkey.id}
							passkey={passkey}
							onDelete={deletePasskey}
						/>
					))}
				</ul>
			</Card>
			<Card title="Ajouter une passkey" padding="lg">
				<AddPasskeyForm />
			</Card>
		</main>
	);
}
