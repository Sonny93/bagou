import { Link } from '@adonisjs/inertia/react';
import type { Data } from '@generated/data';
import { usePage } from '@inertiajs/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { IconButton } from '@minimalstuff/ui';

import { useDismissWhatsNew } from '~/changelog/shared/use_dismiss_whats_new';
import { cn } from '~/shared/lib/cn';
import { urlFor } from '~/shared/lib/url_for';
import { FOCUS_RING_CLASSES } from '~/shared/ui/focus_ring_classes';

type WhatsNewBannerProps = {
	maxWidthClassName: string;
};

export function WhatsNewBanner({
	maxWidthClassName,
}: Readonly<WhatsNewBannerProps>) {
	const { t } = useLingui();
	const { props, url } = usePage<Data.SharedProps>();
	const { isDismissed, dismiss } = useDismissWhatsNew();
	const { whatsNew } = props;
	const isOnChangelogPage =
		url.split('?')[0] === urlFor('changelog.show_changelog');

	if (!whatsNew?.hasUnseen || isDismissed || isOnChangelogPage) return null;
	const { currentVersion } = whatsNew;

	return (
		<aside
			aria-label={t`What's new`}
			className="shrink-0 border-y border-line bg-surface"
		>
			<div
				className={cn(
					'mx-auto flex w-full items-center justify-between gap-3 px-4 py-1.5 text-sm sm:px-6',
					maxWidthClassName
				)}
			>
				<p className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-0.5">
					<span className="text-muted">
						<Trans>Bagou {currentVersion} is here</Trans>
					</span>
					<Link
						route="changelog.show_changelog"
						className={cn(
							'rounded-sm font-medium text-accent-700 underline underline-offset-2 dark:text-accent-300',
							FOCUS_RING_CLASSES
						)}
					>
						<Trans>See what's new</Trans>
					</Link>
				</p>
				<IconButton
					icon="i-tabler-x"
					aria-label={t`Dismiss`}
					variant="ghost"
					size="sm"
					onClick={dismiss}
				/>
			</div>
		</aside>
	);
}
