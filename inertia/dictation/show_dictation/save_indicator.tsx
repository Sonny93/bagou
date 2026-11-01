import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { useEffect, useState } from 'react';

import type { SaveStatus } from './save_status';
import type { ExplicitSave } from './use_save_draft_text';
import { cn } from '~/shared/lib/cn';

const ANNOUNCEMENT_DURATION_MS = 2000;

type SaveStatusDisplay = {
	icon: string;
	message: MessageDescriptor;
	hint: MessageDescriptor;
	className: string;
	iconClassName: string;
	textClassName: string;
};

const HIDDEN_ON_NARROW_CLASSES = 'sr-only sm:not-sr-only';

const AUTO_SAVE_HINT = msg`Edits are saved to the history automatically. Ctrl+S saves now.`;
const NOT_IN_HISTORY_HINT = msg`Dictate a segment to add this text to the history.`;

const SAVE_STATUS_DISPLAYS = {
	none: null,
	pending: null,
	saving: {
		icon: 'i-tabler-loader-2 animate-spin',
		message: msg`Saving…`,
		hint: AUTO_SAVE_HINT,
		className: 'text-muted',
		iconClassName: '',
		textClassName: HIDDEN_ON_NARROW_CLASSES,
	},
	saved: {
		icon: 'i-tabler-check',
		message: msg`Saved`,
		hint: AUTO_SAVE_HINT,
		className: 'text-muted',
		iconClassName: 'text-accent-600 dark:text-accent-400',
		textClassName: HIDDEN_ON_NARROW_CLASSES,
	},
	'not-in-history': {
		icon: 'i-tabler-cloud-off',
		message: msg`Not in history yet`,
		hint: NOT_IN_HISTORY_HINT,
		className: 'text-muted',
		iconClassName: '',
		textClassName: HIDDEN_ON_NARROW_CLASSES,
	},
	failed: {
		icon: 'i-tabler-alert-circle',
		message: msg`Not saved`,
		hint: AUTO_SAVE_HINT,
		className: 'text-signal',
		iconClassName: '',
		textClassName: '',
	},
} as const satisfies Record<SaveStatus, SaveStatusDisplay | null>;

type SaveIndicatorProps = {
	saveStatus: SaveStatus;
	explicitSave: ExplicitSave | null;
};

/**
 * The visible indicator is not a live region: only an explicit save is
 * announced, by the always-mounted status element, which is emptied
 * `ANNOUNCEMENT_DURATION_MS` later so the message never goes stale (failures
 * are announced by their toast). The check animation plays only for an
 * explicit save the server stored. The text shows at every width for a failure
 * and from `sm` up for the other states.
 */
export function SaveIndicator({
	saveStatus,
	explicitSave,
}: Readonly<SaveIndicatorProps>) {
	const { t, i18n } = useLingui();
	const explicitSaveCount = explicitSave?.count ?? 0;
	const [clearedCount, setClearedCount] = useState(0);
	const [animatedCount, setAnimatedCount] = useState(explicitSaveCount);
	if (saveStatus !== 'saved' && animatedCount !== explicitSaveCount) {
		setAnimatedCount(explicitSaveCount);
	}

	useEffect(() => {
		if (explicitSaveCount === 0) return;
		const timer = setTimeout(
			() => setClearedCount(explicitSaveCount),
			ANNOUNCEMENT_DURATION_MS
		);
		return () => clearTimeout(timer);
	}, [explicitSaveCount]);

	const display = SAVE_STATUS_DISPLAYS[saveStatus];
	const announcement = explicitSave?.isStored
		? t`Saved`
		: t`Not in history yet`;
	const isAnnouncing =
		explicitSaveCount > 0 && clearedCount !== explicitSaveCount;
	const isAfterExplicitSave =
		saveStatus === 'saved' && animatedCount !== explicitSaveCount;

	return (
		<>
			{display && (
				<span
					key={`${saveStatus}-${explicitSaveCount}`}
					title={i18n._(display.hint)}
					className={cn(
						'flex items-center gap-1.5 text-sm',
						display.className,
						isAfterExplicitSave && 'copy-confirmation'
					)}
				>
					<span
						className={cn(
							display.icon,
							'size-4 shrink-0',
							display.iconClassName,
							isAfterExplicitSave && 'copy-confirmation-icon'
						)}
						aria-hidden
					/>
					<span className={display.textClassName}>
						{i18n._(display.message)}
					</span>
				</span>
			)}
			<output className="sr-only">
				{isAnnouncing && <span key={explicitSaveCount}>{announcement}</span>}
			</output>
		</>
	);
}
