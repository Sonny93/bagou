import { Badge, Button, Kbd, Tooltip } from '@minimalstuff/ui';

import type { CopyStatus } from './copy_status';
import { cn } from '~/shared/lib/cn';

type CopyStatusDisplay = {
	icon: string;
	message: string;
	className: string;
	isEmphasised: boolean;
};

const COPY_STATUS_DISPLAYS = {
	none: null,
	copied: {
		icon: 'i-tabler-check',
		message: 'Copié',
		className: 'text-muted',
		isEmphasised: false,
	},
	stale: {
		icon: 'i-tabler-clipboard-x',
		message: 'Modifié depuis la copie',
		className: 'text-muted',
		isEmphasised: true,
	},
	failed: {
		icon: 'i-tabler-alert-circle',
		message: 'Copie impossible',
		className: 'text-signal',
		isEmphasised: true,
	},
} as const satisfies Record<CopyStatus, CopyStatusDisplay | null>;

type CopyControlsProps = {
	copyStatus: CopyStatus;
	isCleaned: boolean;
	onCopy: () => void;
};

export function CopyControls({
	copyStatus,
	isCleaned,
	onCopy,
}: Readonly<CopyControlsProps>) {
	const display = COPY_STATUS_DISPLAYS[copyStatus];

	return (
		<div className="flex min-w-0 items-center gap-3">
			<Tooltip
				position="top"
				content={
					<>
						Copier <Kbd>C</Kbd>
					</>
				}
			>
				<Button
					variant={display?.isEmphasised ? 'solid' : 'subtle'}
					startIcon="i-tabler-copy"
					className="shrink-0"
					onClick={onCopy}
				>
					Copier
				</Button>
			</Tooltip>
			{display && (
				<output
					title={display.message}
					className={cn(
						'flex min-w-0 items-center gap-1.5 text-sm',
						display.className
					)}
				>
					<span className={cn(display.icon, 'size-4 shrink-0')} aria-hidden />
					<span className="truncate">{display.message}</span>
				</output>
			)}
			{!isCleaned && (
				<Badge
					color="warning"
					variant="subtle"
					className="shrink-0"
					title="Nettoyage indisponible, texte brut"
				>
					Non nettoyé
				</Badge>
			)}
		</div>
	);
}
