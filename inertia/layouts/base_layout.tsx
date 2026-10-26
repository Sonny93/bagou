import '@minimalstuff/ui/style.css';
import 'virtual:uno.css';

import { TuyauProvider } from '@adonisjs/inertia/react';
import {
	ModalProvider,
	UIProvider,
	type Theme,
	type UILabels,
} from '@minimalstuff/ui';
import type { PropsWithChildren } from 'react';

import { tuyauClient } from '~/shared/lib/tuyau_client';
import { useThemeColorMeta } from '~/shared/theme/use_theme_color_meta';

const THEME_LABELS = {
	light: 'Thème clair',
	dark: 'Thème sombre',
	system: 'Thème du système',
} as const satisfies Record<Theme, string>;

const FRENCH_LABELS: Partial<UILabels> = {
	close: 'Fermer',
	confirm: 'Confirmer',
	cancel: 'Annuler',
	noResults: 'Aucun résultat',
	clearSelection: 'Effacer la sélection',
	search: 'Rechercher',
	clear: 'Effacer',
	required: 'obligatoire',
	currentTheme: (theme) => THEME_LABELS[theme],
};

export function BaseLayout({ children }: Readonly<PropsWithChildren>) {
	useThemeColorMeta();

	return (
		<TuyauProvider client={tuyauClient}>
			<UIProvider labels={FRENCH_LABELS}>
				{children}
				<ModalProvider />
			</UIProvider>
		</TuyauProvider>
	);
}
