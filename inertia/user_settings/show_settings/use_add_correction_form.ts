import { useLingui } from '@lingui/react/macro';
import { useState, type RefObject } from 'react';

import { describeCorrectionFailure } from '~/corrections/shared/describe_correction_failure';
import { describeCorrectionRule } from '~/corrections/shared/describe_correction_rule';
import { readCorrectionFailure } from '~/corrections/shared/read_correction_failure';
import { requestAddCorrection } from '~/corrections/shared/request_add_correction';
import type { CorrectionPair } from '~/dictation/core/correction_pair';
import { logError } from '~/shared/errors/log_error';
import {
	findCorrectionProblems,
	type CorrectionProblems,
} from '~/user_settings/show_settings/find_correction_problems';
import { reloadCorrections } from '~/user_settings/show_settings/reload_corrections';

const NO_PROBLEMS: CorrectionProblems = { heard: null, written: null };

type FieldErrors = {
	heard: string | undefined;
	written: string | undefined;
};

type UseAddCorrectionFormOptions = {
	maxSideLength: number;
	heardRef: RefObject<HTMLInputElement | null>;
	writtenRef: RefObject<HTMLInputElement | null>;
	onAdded: (pair: CorrectionPair) => void;
};

type UseAddCorrectionFormReturn = {
	heard: string;
	written: string;
	setHeard: (heard: string) => void;
	setWritten: (written: string) => void;
	fieldErrors: FieldErrors;
	formError: string | undefined;
	isSubmitting: boolean;
	submit: () => Promise<void>;
};

/**
 * The manual add form of the corrections. Its fields are local state: the
 * pair goes to the server as a JSON call, not as a visit, so the form of the
 * other settings is left alone. The focus goes to the first invalid field, and
 * back to the first one after an addition.
 */
export function useAddCorrectionForm({
	maxSideLength,
	heardRef,
	writtenRef,
	onAdded,
}: Readonly<UseAddCorrectionFormOptions>): UseAddCorrectionFormReturn {
	const { i18n } = useLingui();
	const [heard, setHeard] = useState('');
	const [written, setWritten] = useState('');
	const [problems, setProblems] = useState(NO_PROBLEMS);
	const [formError, setFormError] = useState<string>();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const describeProblem = (rule: string | null): string | undefined =>
		rule === null ? undefined : describeCorrectionRule(rule, i18n);

	const showProblems = (shown: CorrectionProblems) => {
		setProblems(shown);
		const firstInvalid = shown.heard === null ? writtenRef : heardRef;
		firstInvalid.current?.focus();
	};

	const handleFailure = (error: unknown) => {
		logError('Adding a correction failed', error);
		const failure = readCorrectionFailure(error);
		if (failure.kind === 'fields') return showProblems(failure.rules);
		setFormError(describeCorrectionFailure(failure, i18n));
	};

	const send = async (pair: CorrectionPair) => {
		setIsSubmitting(true);
		try {
			await requestAddCorrection(pair);
			await reloadCorrections();
			setHeard('');
			setWritten('');
			onAdded(pair);
			heardRef.current?.focus();
		} catch (error) {
			handleFailure(error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const submit = async () => {
		const clientProblems = findCorrectionProblems(
			heard,
			written,
			maxSideLength
		);
		setFormError(undefined);
		if (clientProblems.heard !== null || clientProblems.written !== null) {
			return showProblems(clientProblems);
		}
		setProblems(clientProblems);
		await send({ heard: heard.trim(), written: written.trim() });
	};

	return {
		heard,
		written,
		setHeard,
		setWritten,
		fieldErrors: {
			heard: describeProblem(problems.heard),
			written: describeProblem(problems.written),
		},
		formError,
		isSubmitting,
		submit,
	};
}
