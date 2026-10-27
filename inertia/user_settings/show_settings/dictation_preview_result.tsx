import { Trans, useLingui } from '@lingui/react/macro';
import { Button } from '@minimalstuff/ui';

import { PreviewTextBlock } from './preview_text_block';
import type { DictationPreviewResult as DictationPreviewResultValue } from './use_dictation_preview';
import { ErrorNotice } from '~/dictation/show_dictation/error_notice';

type DictationPreviewResultProps = {
	result: DictationPreviewResultValue;
	cleanedText: string | null;
	cleanErrorMessage: string | null;
	isCleaning: boolean;
	canCleanAgain: boolean;
	onCleanAgain: () => void;
};

/** The raw and cleaned texts side by side, with a button to clean the raw one again. */
export function DictationPreviewResult({
	result,
	cleanedText,
	cleanErrorMessage,
	isCleaning,
	canCleanAgain,
	onCleanAgain,
}: Readonly<DictationPreviewResultProps>) {
	const { t } = useLingui();
	const isBlank = result.rawText.trim() === '';
	if (isBlank) {
		return (
			<p className="text-muted">
				<Trans>Nothing was heard.</Trans>
			</p>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="grid gap-4 sm:grid-cols-2">
				<PreviewTextBlock label={t`Raw text`}>
					{result.rawText}
				</PreviewTextBlock>
				<PreviewTextBlock label={t`Cleaned text`}>
					{cleanedText ?? t`Cleanup failed, try again`}
				</PreviewTextBlock>
			</div>
			{cleanErrorMessage !== null && (
				<ErrorNotice message={cleanErrorMessage} />
			)}
			<div>
				<Button
					type="button"
					variant="outline"
					loading={isCleaning}
					disabled={!canCleanAgain}
					onClick={onCleanAgain}
				>
					<Trans>Clean again</Trans>
				</Button>
			</div>
		</div>
	);
}
