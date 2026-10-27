import { Trans, useLingui } from '@lingui/react/macro';
import { Button, Textarea } from '@minimalstuff/ui';
import { useState, type ChangeEvent, type KeyboardEvent } from 'react';

import { isRunShortcut } from './is_run_shortcut';
import { PreviewTextBlock } from './preview_text_block';
import { usePreviewCleanup } from './use_preview_cleanup';
import type { PreviewSettings } from '~/dictation/core/dictation_start_request';
import { ErrorNotice } from '~/dictation/show_dictation/error_notice';

const SAMPLE_ROWS = 4;

type TextPreviewProps = {
	settings: Readonly<PreviewSettings>;
	maxLength: number;
	isDisabled: boolean;
};

/** Cleans a sample text with the form values; the text stays between runs. */
export function TextPreview({
	settings,
	maxLength,
	isDisabled,
}: Readonly<TextPreviewProps>) {
	const { t } = useLingui();
	const [sampleText, setSampleText] = useState('');
	const preview = usePreviewCleanup();
	const canRun = !isDisabled && !preview.isCleaning && sampleText.trim() !== '';

	const run = () => {
		if (canRun) preview.clean(sampleText.trim(), settings);
	};
	const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) =>
		setSampleText(event.target.value);
	const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
		if (isRunShortcut(event)) run();
	};

	return (
		<div className="flex flex-col gap-4">
			<Textarea
				label={t`Sample text`}
				description={t`Paste a raw text, as if it had just been dictated. Ctrl+Enter runs the test.`}
				rows={SAMPLE_ROWS}
				maxLength={maxLength}
				value={sampleText}
				onChange={handleChange}
				onKeyDown={handleKeyDown}
			/>
			<div>
				<Button
					type="button"
					loading={preview.isCleaning}
					disabled={!canRun}
					onClick={run}
				>
					<Trans>Test</Trans>
				</Button>
			</div>
			{preview.errorMessage !== null && (
				<ErrorNotice message={preview.errorMessage} />
			)}
			{preview.cleanedText !== null && (
				<PreviewTextBlock label={t`Cleaned text`}>
					{preview.cleanedText}
				</PreviewTextBlock>
			)}
		</div>
	);
}
