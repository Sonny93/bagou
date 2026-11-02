import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import {
	MenuGroup,
	MenuItem,
	MenuSeparator,
	SplitButton,
} from '@minimalstuff/ui';

import type { CleanupControls } from '~/dictation/show_dictation/cleanup_controls';
import type { VersionToggle } from '~/dictation/show_dictation/get_version_toggle';
import type { CleanupQuality } from '~/shared/cleanup_quality';

const CLEANING_MESSAGE = msg`Cleaning the text…`;
const CLEAN_MESSAGE = msg`Clean the text`;

const VERSION_TOGGLE_DISPLAYS = {
	'show-original': {
		icon: 'i-tabler-arrow-back-up',
		message: msg`Show the text before cleanup`,
	},
	'show-cleaned': {
		icon: 'i-tabler-arrow-forward-up',
		message: msg`Show the cleaned text`,
	},
} as const satisfies Record<VersionToggle, unknown>;

const QUALITY_LABELS = {
	standard: msg`Standard`,
	precise: msg`Precise`,
} as const satisfies Record<CleanupQuality, MessageDescriptor>;

type CleanupSplitButtonProps = {
	controls: CleanupControls;
	isCleaningDraft: boolean;
};

export function CleanupSplitButton({
	controls,
	isCleaningDraft,
}: Readonly<CleanupSplitButtonProps>) {
	const { t, i18n } = useLingui();
	const toggleDisplay =
		controls.versionToggle === null
			? null
			: VERSION_TOGGLE_DISPLAYS[controls.versionToggle];

	const renderQualityItem = ({
		value,
		modelName,
	}: {
		value: CleanupQuality;
		modelName: string;
	}) => {
		const qualityLabel = i18n._(QUALITY_LABELS[value]);
		const trailing =
			value === controls.savedQuality
				? t`${qualityLabel} (default)`
				: qualityLabel;
		const handleClick = () => controls.onCleanWith(value);
		return (
			<MenuItem
				key={value}
				icon="i-tabler-sparkles"
				trailing={trailing}
				onClick={handleClick}
			>
				{modelName}
			</MenuItem>
		);
	};

	const menu = (
		<>
			<MenuGroup label={t`Clean with`}>
				{controls.qualities.map(renderQualityItem)}
			</MenuGroup>
			{toggleDisplay && (
				<>
					<MenuSeparator />
					<MenuItem
						icon={toggleDisplay.icon}
						onClick={controls.onToggleVersion}
					>
						{i18n._(toggleDisplay.message)}
					</MenuItem>
				</>
			)}
		</>
	);

	return (
		<SplitButton
			variant="subtle"
			startIcon="i-tabler-sparkles"
			loading={isCleaningDraft}
			className="ml-auto shrink-0 whitespace-nowrap"
			menuLabel={t`More cleanup options`}
			menu={menu}
			onClick={controls.onClean}
		>
			{i18n._(isCleaningDraft ? CLEANING_MESSAGE : CLEAN_MESSAGE)}
		</SplitButton>
	);
}
