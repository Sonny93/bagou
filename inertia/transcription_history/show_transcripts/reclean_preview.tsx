import { Trans, useLingui } from '@lingui/react/macro';
import { Button } from '@minimalstuff/ui';
import { useId } from 'react';

import type { CleanupQuality } from '~/shared/cleanup_quality';
import { CLEANUP_QUALITY_LABELS } from '~/shared/cleanup_quality_labels';

type RecleanPreviewProps = {
	quality: CleanupQuality;
	modelName: string;
	text: string;
	onCopy: (quality: CleanupQuality) => void;
	onDiscard: (quality: CleanupQuality) => void;
};

export function RecleanPreview({
	quality,
	modelName,
	text,
	onCopy,
	onDiscard,
}: Readonly<RecleanPreviewProps>) {
	const { t, i18n } = useLingui();
	const labelId = useId();
	const qualityLabel = i18n._(CLEANUP_QUALITY_LABELS[quality]);

	const handleCopy = () => onCopy(quality);
	const handleDiscard = () => onDiscard(quality);

	return (
		<section
			aria-labelledby={labelId}
			className="flex min-w-0 flex-col gap-2 rounded-lg border border-line p-3"
		>
			<p id={labelId} className="text-sm text-muted [overflow-wrap:anywhere]">
				<Trans>
					{qualityLabel} · {modelName}, from the raw text, with your current
					settings, not saved
				</Trans>
			</p>
			<p className="whitespace-pre-wrap [overflow-wrap:anywhere]">{text}</p>
			<div className="flex flex-wrap gap-2">
				<Button
					variant="subtle"
					size="sm"
					startIcon="i-tabler-copy"
					aria-label={t`Copy the ${qualityLabel} version`}
					onClick={handleCopy}
				>
					<Trans>Copy</Trans>
				</Button>
				<Button
					variant="ghost"
					size="sm"
					startIcon="i-tabler-x"
					aria-label={t`Discard the ${qualityLabel} version`}
					onClick={handleDiscard}
				>
					<Trans>Discard</Trans>
				</Button>
			</div>
		</section>
	);
}
