import './css/app.css';

import { resolvePageComponent } from '@adonisjs/inertia/helpers';
import type { Data } from '@generated/data';
import { createInertiaApp, type ResolvedComponent } from '@inertiajs/react';
import type { ReactElement } from 'react';
import { createRoot } from 'react-dom/client';

import { BaseLayout } from '~/layouts/base_layout';

const PROJECT_NAME = 'Dictée vocale';

void createInertiaApp({
	title: (title) => (title && `${title} — `) + PROJECT_NAME,

	resolve: async (name) => {
		return resolvePageComponent<ResolvedComponent>(
			`./pages/${name}.tsx`,
			import.meta.glob<ResolvedComponent>('./pages/**/*.tsx'),
			(page: ReactElement<Data.SharedProps>) => <BaseLayout>{page}</BaseLayout>
		);
	},

	setup({ el, App, props }) {
		createRoot(el).render(<App {...props} />);
	},
});
