import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { Trans, useLingui } from '@lingui/react/macro';
import { Badge, Button, Kbd, Tooltip } from '@minimalstuff/ui';

import type { CopyStatus } from './copy_status';
import { cn } from '~/shared/lib/cn';

type CopyStatusDisplay = {
	icon: string;
	message: MessageDescriptor;
	className: string;
	iconClassName: string;
	animationClassName: string;
	isEmphasised: boolean;
};

const COPY_STATUS_DISPLAYS = {
	none: null,
	copied: {
		icon: 'i-tabler-check',
		message: msg`Copied`,
		className: 'text-muted',
		iconClassName:
			'copy-confirmation-icon text-accent-600 dark:text-accent-400',
		animationClassName: 'copy-confirmation',
		isEmphasised: false,
	},
	stale: {
		icon: 'i-tabler-clipboard-x',
		message: msg`Modified since the copy`,
		className: 'text-muted',
		iconClassName: '',
		animationClassName: '',
		isEmphasised: true,
	},
	failed: {
		icon: 'i-tabler-alert-circle',
		message: msg`Copy failed`,
		className: 'text-signal',
		iconClassName: '',
		animationClassName: '',
		isEmphasised: true,
	},
} as const satisfies Record<CopyStatus, CopyStatusDisplay | null>;

type CopyControlsProps = {
	copyStatus: CopyStatus;
	copyCount: number;
	isCleaned: boolean;
	onCopy: () => void;
};

export function CopyControls({
	copyStatus,
	copyCount,
	isCleaned,
	onCopy,
}: Readonly<CopyControlsProps>) {
	const { t, i18n } = useLingui();
	const display = COPY_STATUS_DISPLAYS[copyStatus];
	const outputKey =
		copyStatus === 'copied' ? `copied-${copyCount}` : copyStatus;

	return (
		<div className="flex min-w-0 items-center gap-3">
			<Tooltip
				position="top"
				content={
					<>
						<Trans>Copy</Trans> <Kbd>C</Kbd>
					</>
				}
			>
				<Button
					variant={display?.isEmphasised ? 'solid' : 'subtle'}
					startIcon="i-tabler-copy"
					className="shrink-0"
					onClick={onCopy}
				>
					<Trans>Copy</Trans>
				</Button>
			</Tooltip>
			{display && (
				<output
					key={outputKey}
					title={i18n._(display.message)}
					className={cn(
						'flex min-w-0 items-center gap-1.5 text-sm',
						display.className,
						display.animationClassName
					)}
				>
					<span
						className={cn(
							display.icon,
							'size-4 shrink-0',
							display.iconClassName
						)}
						aria-hidden
					/>
					<span className="truncate">{i18n._(display.message)}</span>
				</output>
			)}
			{!isCleaned && (
				<Badge
					color="warning"
					variant="subtle"
					className="shrink-0"
					title={t`Cleanup unavailable, raw text`}
				>
					<Trans>Not cleaned</Trans>
				</Badge>
			)}
		</div>
	);
}
