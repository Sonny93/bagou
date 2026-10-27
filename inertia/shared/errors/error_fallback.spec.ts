import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ErrorFallback } from './error_fallback';
import { activateLocale } from '~/i18n/activate_locale';

const renderFallback = (): string =>
	renderToStaticMarkup(
		createElement(
			I18nProvider,
			{ i18n },
			createElement(ErrorFallback, { onReload: () => undefined })
		)
	);

describe('ErrorFallback', () => {
	it('should tell the page failed and offer to reload it', () => {
		const markup = renderFallback();

		expect(markup).toContain('Something went wrong while displaying this page');
		expect(markup).toContain('Reload');
	});

	it('should word the fallback in French when the French locale is active', async () => {
		await activateLocale('fr');

		const markup = renderFallback();

		expect(markup).toContain(
			'Une erreur est survenue à l&#x27;affichage de cette page'
		);
		expect(markup).toContain('Recharger');
	});
});
