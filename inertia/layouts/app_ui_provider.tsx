import { useLingui } from '@lingui/react/macro';
import { FRENCH_UI_LABELS, UIProvider } from '@minimalstuff/ui';
import type { ReactNode } from 'react';

const FRENCH_LOCALE = 'fr';

/** Provides the labels of the lib components in the active language. */
export function AppUIProvider({ children }: Readonly<{ children: ReactNode }>) {
	const { i18n } = useLingui();
	const labels = i18n.locale.startsWith(FRENCH_LOCALE)
		? FRENCH_UI_LABELS
		: undefined;

	return <UIProvider labels={labels}>{children}</UIProvider>;
}
