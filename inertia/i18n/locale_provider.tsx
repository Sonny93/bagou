import type { Data } from '@generated/data';
import { usePage } from '@inertiajs/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { useEffect, useState, type ReactNode } from 'react';

import { activateLocale } from '~/i18n/activate_locale';
import { DocumentTitle } from '~/i18n/document_title';
import { resolveLocale } from '~/i18n/resolve_locale';
import { usePreferredLanguages } from '~/i18n/use_preferred_languages';

type LocaleProviderProps = {
	children: ReactNode;
};

/**
 * Keeps Lingui on the locale chosen by the shared `interfaceLanguage` prop (or
 * the browser languages for `system` and for guests) and mirrors it on
 * `<html lang>` and the document title. Renders nothing until the first catalog is loaded,
 * so no untranslated text flashes.
 */
export function LocaleProvider({ children }: Readonly<LocaleProviderProps>) {
	const { interfaceLanguage } = usePage<Data.SharedProps>().props;
	const preferredLanguages = usePreferredLanguages();
	const [isActivated, setIsActivated] = useState(false);
	const locale = resolveLocale(
		interfaceLanguage ?? 'system',
		preferredLanguages
	);

	useEffect(() => {
		let isCurrent = true;
		void activateLocale(locale).then(() => {
			if (!isCurrent) return;
			document.documentElement.lang = locale;
			setIsActivated(true);
		});
		return () => {
			isCurrent = false;
		};
	}, [locale]);

	if (!isActivated) return null;
	return (
		<I18nProvider i18n={i18n}>
			<DocumentTitle />
			{children}
		</I18nProvider>
	);
}
