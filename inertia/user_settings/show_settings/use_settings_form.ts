import type { Data } from '@generated/data';
import { useForm } from '@inertiajs/react';
import { useLingui } from '@lingui/react/macro';

import { describeFieldError } from './describe_field_error';
import { describeVocabularyProblem } from './describe_vocabulary_problem';
import { findVocabularyProblem } from './find_vocabulary_problem';
import { formatVocabulary } from './format_vocabulary';
import { parseVocabulary } from './parse_vocabulary';
import { pickVocabularyError } from './pick_vocabulary_error';
import type { SettingsLimits } from './settings_limits';
import type { PreviewSettings } from '~/dictation/core/dictation_start_request';
import { urlFor } from '~/shared/lib/url_for';

type SettingsFormData = {
	dictationLanguage: Data.UserSettings['dictationLanguage'];
	interfaceLanguage: Data.UserSettings['interfaceLanguage'];
	vocabularyText: string;
	cleanupInstructions: string;
};

type FieldErrors = {
	dictationLanguage: string | undefined;
	interfaceLanguage: string | undefined;
	vocabulary: string | undefined;
	cleanupInstructions: string | undefined;
};

type UseSettingsFormReturn = {
	data: SettingsFormData;
	setDictationLanguage: (
		language: SettingsFormData['dictationLanguage']
	) => void;
	setInterfaceLanguage: (
		language: SettingsFormData['interfaceLanguage']
	) => void;
	setVocabularyText: (vocabularyText: string) => void;
	setCleanupInstructions: (cleanupInstructions: string) => void;
	termCount: number;
	fieldErrors: FieldErrors;
	previewSettings: PreviewSettings;
	isSubmitDisabled: boolean;
	isProcessing: boolean;
	isSaved: boolean;
	submit: () => void;
};

export function useSettingsForm(
	settings: Data.UserSettings,
	limits: Readonly<SettingsLimits>
): UseSettingsFormReturn {
	const { i18n } = useLingui();
	const form = useForm<SettingsFormData>({
		dictationLanguage: settings.dictationLanguage,
		interfaceLanguage: settings.interfaceLanguage,
		vocabularyText: formatVocabulary(settings.vocabulary),
		cleanupInstructions: settings.cleanupInstructions,
	});
	form.transform(({ vocabularyText, ...rest }) => ({
		...rest,
		vocabulary: parseVocabulary(vocabularyText),
	}));

	const terms = parseVocabulary(form.data.vocabularyText);
	const vocabularyProblem = findVocabularyProblem(terms, limits);
	const serverVocabularyError = pickVocabularyError(form.errors);

	const describeError = (rule: string | undefined) =>
		rule === undefined ? undefined : describeFieldError(rule, i18n);
	const fieldErrors: FieldErrors = {
		dictationLanguage: describeError(form.errors.dictationLanguage),
		interfaceLanguage: describeError(form.errors.interfaceLanguage),
		vocabulary:
			vocabularyProblem === null
				? describeError(serverVocabularyError)
				: describeVocabularyProblem(vocabularyProblem, i18n),
		cleanupInstructions: describeError(form.errors.cleanupInstructions),
	};

	const handleSuccess = () =>
		form.setData('vocabularyText', formatVocabulary(terms));

	const submit = () =>
		form.put(urlFor('user_settings.update_settings'), {
			preserveScroll: true,
			onSuccess: handleSuccess,
		});

	return {
		data: form.data,
		setDictationLanguage: (language) =>
			form.setData('dictationLanguage', language),
		setInterfaceLanguage: (language) =>
			form.setData('interfaceLanguage', language),
		setVocabularyText: (vocabularyText) =>
			form.setData('vocabularyText', vocabularyText),
		setCleanupInstructions: (cleanupInstructions) =>
			form.setData('cleanupInstructions', cleanupInstructions),
		termCount: terms.length,
		fieldErrors,
		previewSettings: {
			dictationLanguage: form.data.dictationLanguage,
			vocabulary: terms,
			cleanupInstructions: form.data.cleanupInstructions,
		},
		isSubmitDisabled: vocabularyProblem !== null,
		isProcessing: form.processing,
		isSaved: form.recentlySuccessful,
		submit,
	};
}
