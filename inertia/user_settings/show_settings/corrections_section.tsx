import type { Data } from '@generated/data';
import { Trans, useLingui } from '@lingui/react/macro';
import { useId, useState } from 'react';

import type { CorrectionPair } from '~/dictation/core/correction_pair';
import { cn } from '~/shared/lib/cn';
import { FOCUS_RING_CLASSES } from '~/shared/ui/focus_ring_classes';
import { AddCorrectionForm } from '~/user_settings/show_settings/add_correction_form';
import { BeyondSpeechLimitWarning } from '~/user_settings/show_settings/beyond_speech_limit_warning';
import { CorrectionsList } from '~/user_settings/show_settings/corrections_list';
import type { SettingsLimits } from '~/user_settings/show_settings/settings_limits';
import { useCorrectionsFocus } from '~/user_settings/show_settings/use_corrections_focus';

type CorrectionsSectionProps = {
	corrections: readonly Data.Corrections.Correction[];
	beyondSpeechLimit: number;
	limits: SettingsLimits;
};

/**
 * The corrections remembered from the dictations, saved as soon as they are
 * added or deleted, so apart from the form that saves the other settings.
 */
export function CorrectionsSection({
	corrections,
	beyondSpeechLimit,
	limits,
}: Readonly<CorrectionsSectionProps>) {
	const { t } = useLingui();
	const headingId = useId();
	const [announcement, setAnnouncement] = useState('');
	const { headingRef, deleteCorrection } = useCorrectionsFocus(corrections);

	const handleAdded = ({ heard, written }: CorrectionPair) =>
		setAnnouncement(t`Correction added: ${written} for ${heard}`);

	const deleteAndAnnounce = async (id: number) => {
		const deleted = corrections.find((correction) => correction.id === id);
		const isDeleted = await deleteCorrection(id);
		if (!isDeleted || deleted === undefined) return;
		const { heard, written } = deleted;
		setAnnouncement(t`Correction deleted: ${written} for ${heard}`);
	};

	const handleDelete = (id: number) => void deleteAndAnnounce(id);

	return (
		<section
			aria-labelledby={headingId}
			className="flex flex-col gap-4 border-t border-line pt-6"
		>
			<div className="flex flex-col gap-1">
				<h2
					id={headingId}
					ref={headingRef}
					tabIndex={-1}
					className={cn('text-xl font-semibold', FOCUS_RING_CLASSES)}
				>
					<Trans>Corrections</Trans>
				</h2>
				<p className="text-muted">
					<Trans>
						Words you fixed after they were misheard. They teach the cleanup and
						the speech recognition your past mishearings, are saved as soon as
						you change them, and are kept apart from the history: deleting the
						history keeps them.
					</Trans>
				</p>
				<p className="text-sm text-muted tabular-nums">
					<Trans>
						{corrections.length} of {limits.maxCorrections} corrections
					</Trans>
				</p>
			</div>
			{beyondSpeechLimit > 0 && (
				<BeyondSpeechLimitWarning count={beyondSpeechLimit} />
			)}
			<CorrectionsList corrections={corrections} onDelete={handleDelete} />
			<AddCorrectionForm
				maxSideLength={limits.maxCorrectionSideLength}
				onAdded={handleAdded}
			/>
			<output className="sr-only">{announcement}</output>
		</section>
	);
}
