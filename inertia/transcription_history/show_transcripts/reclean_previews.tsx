import { useContext } from 'react';

import type { CleanupQuality } from '~/shared/cleanup_quality';
import { RecleanOptionsContext } from '~/transcription_history/show_transcripts/reclean_options_context';
import { RecleanPreview } from '~/transcription_history/show_transcripts/reclean_preview';
import type { QualityEntries } from '~/transcription_history/show_transcripts/update_quality_entries';

type RecleanPreviewsProps = {
	previews: QualityEntries<string>;
	onCopy: (quality: CleanupQuality) => void;
	onDiscard: (quality: CleanupQuality) => void;
};

export function RecleanPreviews({
	previews,
	onCopy,
	onDiscard,
}: Readonly<RecleanPreviewsProps>) {
	const { qualities } = useContext(RecleanOptionsContext);
	const shownQualities = qualities.filter(({ value }) => previews[value]);

	return shownQualities.map(({ value, modelName }) => (
		<RecleanPreview
			key={value}
			quality={value}
			modelName={modelName}
			text={previews[value] ?? ''}
			onCopy={onCopy}
			onDiscard={onDiscard}
		/>
	));
}
