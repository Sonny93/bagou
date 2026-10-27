import { Trans, useLingui } from '@lingui/react/macro';
import { Tabs } from '@minimalstuff/ui';

import { DictationPreview } from './dictation_preview';
import { TextPreview } from './text_preview';
import type { PreviewSettings } from '~/dictation/core/dictation_start_request';

type SettingsPreviewProps = {
	settings: Readonly<PreviewSettings>;
	maxSampleTextLength: number;
	isDisabled: boolean;
};

/**
 * Tries the values of the form, saved or not, on a sample text or a real
 * dictation. Every run is an explicit click and nothing is saved.
 */
export function SettingsPreview({
	settings,
	maxSampleTextLength,
	isDisabled,
}: Readonly<SettingsPreviewProps>) {
	const { t } = useLingui();
	const items = [
		{
			title: t`Text`,
			content: (
				<TextPreview
					settings={settings}
					maxLength={maxSampleTextLength}
					isDisabled={isDisabled}
				/>
			),
		},
		{
			title: t`Dictation`,
			content: <DictationPreview settings={settings} isDisabled={isDisabled} />,
		},
	];

	return (
		<section className="flex flex-col gap-4 border-t border-line pt-6">
			<div className="flex flex-col gap-1">
				<h2 className="text-xl font-semibold">
					<Trans>Test</Trans>
				</h2>
				<p className="text-muted">
					<Trans>
						Try the values above, saved or not. Tested settings are not saved
						until you click Save.
					</Trans>
				</p>
			</div>
			<Tabs items={items} keepMounted />
		</section>
	);
}
