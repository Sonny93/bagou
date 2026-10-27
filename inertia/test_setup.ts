import { beforeEach } from 'vitest';

import { activateLocale } from '~/i18n/activate_locale';

beforeEach(async () => {
	await activateLocale('en');
});
