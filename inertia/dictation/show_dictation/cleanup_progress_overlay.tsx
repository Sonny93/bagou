import { Trans, useLingui } from '@lingui/react/macro';
import { useId, useMemo } from 'react';

import { useOverlayPhase } from '~/dictation/show_dictation/use_overlay_phase';
import { useTweenedValue } from '~/dictation/show_dictation/use_tweened_value';
import { cn } from '~/shared/lib/cn';

const FULL_PERCENT = 100;

type CleanupProgressOverlayProps = {
	isActive: boolean;
	percent: number;
};

type CleanupProgressBarProps = {
	isActive: boolean;
	percent: number;
};

function CleanupProgressBar({
	isActive,
	percent,
}: Readonly<CleanupProgressBarProps>) {
	const { i18n } = useLingui();
	const labelId = useId();
	const tweenedPercent = useTweenedValue(percent);
	const displayedPercent = isActive ? tweenedPercent : FULL_PERCENT;
	const percentFormat = useMemo(
		() =>
			new Intl.NumberFormat(i18n.locale, {
				style: 'percent',
				maximumFractionDigits: 0,
			}),
		[i18n.locale]
	);
	const formattedPercent = percentFormat.format(
		Math.round(displayedPercent) / FULL_PERCENT
	);
	const fillStyle = { transform: `scaleX(${displayedPercent / FULL_PERCENT})` };

	return (
		<div className="relative flex flex-col items-center gap-2">
			<p id={labelId} className="text-sm text-gray-900 dark:text-gray-100">
				<Trans>Cleaning the text…</Trans>
			</p>
			<progress
				className="sr-only"
				max={FULL_PERCENT}
				value={isActive ? percent : FULL_PERCENT}
				aria-labelledby={labelId}
			/>
			<div className="flex items-center gap-3">
				<div
					className="cleanup-track h-1.5 w-50 shrink-0 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
					aria-hidden
				>
					<div
						className="cleanup-fill h-full origin-left bg-accent-600 dark:bg-accent-400"
						style={fillStyle}
					/>
				</div>
				<span
					className="shrink-0 text-sm font-medium tabular-nums text-gray-900 dark:text-gray-100"
					aria-hidden
				>
					{formattedPercent}
				</span>
			</div>
		</div>
	);
}

export function CleanupProgressOverlay({
	isActive,
	percent,
}: Readonly<CleanupProgressOverlayProps>) {
	const phase = useOverlayPhase(isActive);

	if (phase === 'hidden') return null;

	return (
		<div
			className={cn(
				'pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-4 bg-black/20 backdrop-blur-[2px]',
				'transition-opacity duration-200 ease-out motion-reduce:transition-none',
				phase === 'visible' ? 'opacity-100' : 'opacity-0'
			)}
		>
			<CleanupProgressBar isActive={isActive} percent={percent} />
		</div>
	);
}
