import { Badge, Button } from '@minimalstuff/ui';

import type { CopyStatus } from './copy_status';
import { cn } from '~/shared/lib/cn';

type CopyStatusDisplay = { icon: string; message: string; className: string };

const COPY_STATUS_DISPLAYS = {
	none: null,
	copied: {
		icon: 'i-tabler-check',
		message: 'Copié dans le presse-papier',
		className: 'text-muted',
	},
	failed: {
		icon: 'i-tabler-alert-circle',
		message: 'Copie impossible, utilise le bouton Copier',
		className: 'text-signal',
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
		<div className="flex flex-wrap items-center gap-x-3 gap-y-2">
			<Button startIcon="i-tabler-copy" onClick={onCopy}>
				Copier
			</Button>
			<output
				className={cn('flex items-center gap-1.5 text-sm', display?.className)}
			>
				{display && <span className={cn(display.icon, 'size-4')} aria-hidden />}
				{display?.message}
			</output>
			{!isCleaned && (
				<Badge color="warning" variant="subtle">
					Texte brut, nettoyage indisponible
				</Badge>
			)}
		</div>
	);
}
