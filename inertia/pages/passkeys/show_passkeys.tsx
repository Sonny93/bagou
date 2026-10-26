import type { Data } from '@generated/data';

import { AddPasskeyForm } from '~/passkeys/show_passkeys/add_passkey_form';
import { PasskeyRow } from '~/passkeys/show_passkeys/passkey_row';
import { useDeletePasskey } from '~/passkeys/show_passkeys/use_delete_passkey';
import { AppHeader } from '~/shared/ui/app_header';
import { AppThemeToggle } from '~/shared/ui/app_theme_toggle';
import { BackToDictationLink } from '~/shared/ui/back_to_dictation_link';

type ShowPasskeysProps = {
	passkeys: Data.Passkey[];
};

export default function ShowPasskeys({
	passkeys,
}: Readonly<ShowPasskeysProps>) {
	const deletePasskey = useDeletePasskey();

	return (
		<div className="flex min-h-dvh flex-col">
			<AppHeader maxWidthClassName="max-w-xl">
				<BackToDictationLink />
				<AppThemeToggle />
			</AppHeader>
			<main className="mx-auto flex w-full max-w-xl flex-col gap-8 px-4 py-6 sm:px-6">
				<div className="flex flex-col gap-1">
					<h1 className="text-2xl font-semibold">Passkeys</h1>
					<p className="text-muted">
						Les appareils qui peuvent ouvrir ta session.
					</p>
				</div>
				<ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
					{passkeys.map((passkey) => (
						<PasskeyRow
							key={passkey.id}
							passkey={passkey}
							onDelete={deletePasskey}
						/>
					))}
				</ul>
				<section className="flex flex-col gap-4">
					<h2 className="text-base font-semibold">Ajouter une passkey</h2>
					<AddPasskeyForm />
				</section>
			</main>
		</div>
	);
}
