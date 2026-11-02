import { useLingui } from '@lingui/react/macro';
import { RadioOptions } from '@minimalstuff/ui';

import type {
	CleanupQuality,
	CleanupQualityOption,
} from '~/shared/cleanup_quality';
import { describeCleanupQuality } from '~/user_settings/show_settings/describe_cleanup_quality';

type CleanupQualityFieldProps = {
	value: CleanupQuality;
	qualities: readonly CleanupQualityOption[];
	error: string | undefined;
	onChange: (value: CleanupQuality) => void;
};

export function CleanupQualityField({
	value,
	qualities,
	error,
	onChange,
}: Readonly<CleanupQualityFieldProps>) {
	const { t, i18n } = useLingui();

	const handleChange = (selectedValue: string) => {
		const selected = qualities.find(
			(quality) => quality.value === selectedValue
		);
		if (selected !== undefined) onChange(selected.value);
	};

	return (
		<RadioOptions
			name="cleanupQuality"
			label={t`Cleanup model`}
			options={qualities.map((quality) =>
				describeCleanupQuality(quality, i18n)
			)}
			value={value}
			error={error}
			onChange={handleChange}
		/>
	);
}
