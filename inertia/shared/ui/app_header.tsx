import { Link } from '@adonisjs/inertia/react';
import type { ReactNode } from 'react';

import { cn } from '~/shared/lib/cn';
import { FOCUS_RING_CLASSES } from '~/shared/ui/focus_ring_classes';

const BRAND_ICON_SIZE = 24;

type AppHeaderProps = {
	children?: ReactNode;
	maxWidthClassName?: string;
};

export const AppHeader = ({
	children,
	maxWidthClassName = 'max-w-3xl',
}: Readonly<AppHeaderProps>) => (
	<header className="shrink-0">
		<div
			className={cn(
				'mx-auto flex w-full items-center justify-between gap-3 px-4 py-3 sm:px-6',
				maxWidthClassName
			)}
		>
			<Link
				route="dictation.show_dictation"
				className={cn(
					'flex items-center gap-2 rounded-md font-semibold',
					FOCUS_RING_CLASSES
				)}
			>
				<img
					src="/icons/icon.svg"
					width={BRAND_ICON_SIZE}
					height={BRAND_ICON_SIZE}
					alt=""
				/>
				Dictée
			</Link>
			<div className="flex items-center gap-2 sm:gap-3">{children}</div>
		</div>
	</header>
);
