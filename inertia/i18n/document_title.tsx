import { Head } from '@inertiajs/react';
import { useLingui } from '@lingui/react/macro';

import { PROJECT_NAME } from '~/i18n/project_name';

/** The project name as document title, in the active locale: Inertia's head manager owns `<title>`. */
export function DocumentTitle() {
	const { i18n } = useLingui();
	return <Head title={i18n._(PROJECT_NAME)} />;
}
