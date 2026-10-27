import { Head } from '@inertiajs/react';

const PROJECT_NAME = 'Bagou';

/** The project name as document title: Inertia's head manager owns `<title>`. */
export const DocumentTitle = () => <Head title={PROJECT_NAME} />;
