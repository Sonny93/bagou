import type { Data } from '@generated/data';
import { Trans } from '@lingui/react/macro';
import { Button } from '@minimalstuff/ui';
import type { SubmitEvent } from 'react';

import { CleanupInstructionsField } from './cleanup_instructions_field';
import { DictationLanguageSelect } from './dictation_language_select';
import { InterfaceLanguageSelect } from './interface_language_select';
import { SavedStatus } from './saved_status';
import type { SettingsLimits } from './settings_limits';
import { useSettingsForm } from './use_settings_form';
import { VocabularyField } from './vocabulary_field';

type SettingsFormProps = {
	settings: Data.UserSettings;
	limits: SettingsLimits;
	dictationLanguages: Data.UserSettings['dictationLanguage'][];
	interfaceLanguages: Data.UserSettings['interfaceLanguage'][];
};

export function SettingsForm({
	settings,
	limits,
	dictationLanguages,
	interfaceLanguages,
}: Readonly<SettingsFormProps>) {
	const form = useSettingsForm(settings, limits);

	const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		form.submit();
	};

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-6">
			<DictationLanguageSelect
				value={form.data.dictationLanguage}
				languages={dictationLanguages}
				error={form.fieldErrors.dictationLanguage}
				onChange={form.setDictationLanguage}
			/>
			<InterfaceLanguageSelect
				value={form.data.interfaceLanguage}
				languages={interfaceLanguages}
				error={form.fieldErrors.interfaceLanguage}
				onChange={form.setInterfaceLanguage}
			/>
			<VocabularyField
				value={form.data.vocabularyText}
				termCount={form.termCount}
				maxTermCount={limits.maxVocabularyTerms}
				error={form.fieldErrors.vocabulary}
				onChange={form.setVocabularyText}
			/>
			<CleanupInstructionsField
				value={form.data.cleanupInstructions}
				maxLength={limits.maxInstructionsLength}
				error={form.fieldErrors.cleanupInstructions}
				onChange={form.setCleanupInstructions}
			/>
			<div className="flex items-center gap-4">
				<Button
					type="submit"
					loading={form.isProcessing}
					disabled={form.isSubmitDisabled}
				>
					<Trans>Save</Trans>
				</Button>
				{form.isSaved && <SavedStatus />}
			</div>
		</form>
	);
}
