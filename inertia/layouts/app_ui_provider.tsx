import type { I18n } from '@lingui/core';
import { msg, plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { UIProvider, type Theme, type UILabels } from '@minimalstuff/ui';
import type { ReactNode } from 'react';

const THEME_LABELS = {
	light: msg`Light theme`,
	dark: msg`Dark theme`,
	system: msg`System theme`,
} as const satisfies Record<Theme, unknown>;

function buildLabels(i18n: I18n): UILabels {
	return {
		close: i18n._(msg`Close`),
		confirm: i18n._(msg`Confirm`),
		cancel: i18n._(msg`Cancel`),
		noResults: i18n._(msg`No results`),
		clearSelection: i18n._(msg`Clear selection`),
		search: i18n._(msg`Search`),
		clear: i18n._(msg`Clear`),
		required: i18n._(msg`required`),
		currentTheme: (theme) => i18n._(THEME_LABELS[theme]),
		overflowCount: (hiddenCount) => `+${hiddenCount}`,
		selectedCount: (selectedCount) =>
			i18n._(
				msg`${plural(selectedCount, { one: '# selected', other: '# selected' })}`
			),
		maxSelectedHint: (maxSelectedValues) =>
			i18n._(
				msg`${plural(maxSelectedValues, {
					one: 'Maximum of # value reached',
					other: 'Maximum of # values reached',
				})}`
			),
	};
}

/** Provides the labels of the lib components in the active language. */
export function AppUIProvider({ children }: Readonly<{ children: ReactNode }>) {
	const { i18n } = useLingui();

	return <UIProvider labels={buildLabels(i18n)}>{children}</UIProvider>;
}
