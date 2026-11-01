import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { Trans, useLingui } from '@lingui/react/macro';
import { Badge, Button, Kbd, Tooltip } from '@minimalstuff/ui';
import type { Ref } from 'react';

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
	'selection-copied': {
		icon: 'i-tabler-check',
		message: msg`Selection copied`,
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

const CLEANING_MESSAGE = msg`Cleaning the text…`;

type CopyControlsProps = {
	copyStatus: CopyStatus;
	copyCount: number;
	isCleaned: boolean;
	isCleaningDraft: boolean;
	copyButtonRef: Ref<HTMLButtonElement>;
	onCopy: () => void;
	onCleanDraft: () => void;
};

export function CopyControls({
	copyStatus,
	copyCount,
	isCleaned,
	isCleaningDraft,
	copyButtonRef,
	onCopy,
	onCleanDraft,
}: Readonly<CopyControlsProps>) {
	const { t, i18n } = useLingui();
	const display = COPY_STATUS_DISPLAYS[copyStatus];
	const isCopyConfirmation =
		copyStatus === 'copied' || copyStatus === 'selection-copied';
	const outputKey = isCopyConfirmation
		? `${copyStatus}-${copyCount}`
		: copyStatus;

	return (
		<div className="flex min-w-0 flex-1 items-center gap-3">
			<Tooltip
				position="top"
				content={
					<>
						<Trans>Copy</Trans> <Kbd>C</Kbd>
					</>
				}
			>
				<Button
					ref={copyButtonRef}
					variant={display?.isEmphasised ? 'solid' : 'subtle'}
					startIcon="i-tabler-copy"
					className="shrink-0 [&[aria-disabled=true]>*]:opacity-60"
					aria-disabled={isCleaningDraft}
					onClick={isCleaningDraft ? undefined : onCopy}
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
			<Button
				variant="subtle"
				startIcon={
					isCleaningDraft
						? 'i-tabler-loader-2 animate-spin'
						: 'i-tabler-sparkles'
				}
				className="ml-auto shrink-0 whitespace-nowrap [&[aria-disabled=true]>*]:opacity-60"
				aria-disabled={isCleaningDraft}
				onClick={isCleaningDraft ? undefined : onCleanDraft}
			>
				{isCleaningDraft ? (
					i18n._(CLEANING_MESSAGE)
				) : (
					<Trans>Clean the text</Trans>
				)}
			</Button>
		</div>
	);
}
