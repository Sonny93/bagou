import type { ReactNode } from 'react';

import { AppThemeToggle } from '~/shared/ui/app_theme_toggle';

const BRAND_ICON_SIZE = 48;

type PasskeyCardPageProps = {
	title: string;
	intro?: string;
	children: ReactNode;
};

export const PasskeyCardPage = ({
	title,
	intro,
	children,
}: Readonly<PasskeyCardPageProps>) => (
	<main className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
		<div className="fixed top-3 right-3">
			<AppThemeToggle />
		</div>
		<div className="flex w-full max-w-sm flex-col gap-8">
			<header className="flex flex-col items-center gap-3 text-center">
				<img
					src="/icons/icon.svg"
					width={BRAND_ICON_SIZE}
					height={BRAND_ICON_SIZE}
					alt=""
				/>
				<h1 className="text-2xl font-semibold">{title}</h1>
				{intro && <p className="text-sm text-muted">{intro}</p>}
			</header>
			<div className="flex flex-col gap-4">{children}</div>
		</div>
	</main>
);
