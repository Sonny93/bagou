import '@minimalstuff/ui/style.css';
import 'virtual:uno.css';

import { TuyauProvider } from '@adonisjs/inertia/react';
import { ModalProvider, UIProvider, type UILabels } from '@minimalstuff/ui';
import type { PropsWithChildren } from 'react';

import { tuyauClient } from '~/shared/lib/tuyau_client';

const FRENCH_LABELS: Partial<UILabels> = {
	close: 'Fermer',
	confirm: 'Confirmer',
	cancel: 'Annuler',
	noResults: 'Aucun résultat',
	clearSelection: 'Effacer la sélection',
	search: 'Rechercher',
	clear: 'Effacer',
	required: 'obligatoire',
};

export function BaseLayout({ children }: Readonly<PropsWithChildren>) {
	return (
		<TuyauProvider client={tuyauClient}>
			<UIProvider labels={FRENCH_LABELS}>
				{children}
				<ModalProvider />
			</UIProvider>
		</TuyauProvider>
	);
}
