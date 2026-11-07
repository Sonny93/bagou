import { useLingui } from '@lingui/react/macro';
import { IconButton, Menu, MenuGroup, MenuItem } from '@minimalstuff/ui';
import { type Ref, useContext } from 'react';

import type { CleanupQuality } from '~/shared/cleanup_quality';
import { CLEANUP_QUALITY_LABELS } from '~/shared/cleanup_quality_labels';
import { RecleanOptionsContext } from '~/transcription_history/show_transcripts/reclean_options_context';
import type { QualityEntries } from '~/transcription_history/show_transcripts/update_quality_entries';

const RECLEAN_ICON = 'i-tabler-refresh';

type RecleanMenuProps = {
	accessibleDate: string;
	runningQualities: QualityEntries<true>;
	menuRef: Ref<HTMLSpanElement>;
	onReclean: (quality: CleanupQuality) => void;
};

export function RecleanMenu({
	accessibleDate,
	runningQualities,
	menuRef,
	onReclean,
}: Readonly<RecleanMenuProps>) {
	const { t, i18n } = useLingui();
	const { qualities, savedQuality } = useContext(RecleanOptionsContext);
	const isRunning = Object.keys(runningQualities).length > 0;

	const describeTrailing = (
		qualityLabel: string,
		isDefault: boolean,
		isRunning: boolean
	): string => {
		if (isRunning) return t`${qualityLabel} (running)`;
		return isDefault ? t`${qualityLabel} (default)` : qualityLabel;
	};

	const renderQualityItem = ({
		value,
		modelName,
	}: {
		value: CleanupQuality;
		modelName: string;
	}) => {
		const qualityLabel = i18n._(CLEANUP_QUALITY_LABELS[value]);
		const trailing = describeTrailing(
			qualityLabel,
			value === savedQuality,
			runningQualities[value] === true
		);
		const handleClick = () => onReclean(value);
		return (
			<MenuItem
				key={value}
				icon={RECLEAN_ICON}
				trailing={trailing}
				disabled={runningQualities[value] === true}
				onClick={handleClick}
			>
				{modelName}
			</MenuItem>
		);
	};

	const trigger = (
		<IconButton
			icon={RECLEAN_ICON}
			aria-label={t`Clean the dictation from ${accessibleDate} again from the raw text`}
			aria-busy={isRunning}
			variant="ghost"
			size="sm"
			tooltip
		/>
	);

	return (
		<Menu trigger={trigger} align="end" ref={menuRef}>
			<MenuGroup label={t`Clean again from the raw text with`}>
				{qualities.map(renderQualityItem)}
			</MenuGroup>
		</Menu>
	);
}
