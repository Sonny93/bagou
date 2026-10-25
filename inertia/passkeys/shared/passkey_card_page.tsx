import { Card } from '@minimalstuff/ui';
import type { ReactNode } from 'react';

type PasskeyCardPageProps = {
	title: string;
	children: ReactNode;
};

export const PasskeyCardPage = ({
	title,
	children,
}: Readonly<PasskeyCardPageProps>) => (
	<main className="flex min-h-screen items-center justify-center bg-gray-50 p-6 dark:bg-gray-800">
		<Card title={title} padding="lg" className="w-full max-w-md">
			<div className="flex flex-col gap-4">{children}</div>
		</Card>
	</main>
);
