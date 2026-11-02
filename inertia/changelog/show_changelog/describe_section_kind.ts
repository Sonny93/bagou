import type { I18n, MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import type { ChangelogSectionKind } from '~/changelog/changelog_section_kind';

const SECTION_KIND_LABELS = {
	Added: msg({
		message: 'New',
		context: 'Changelog section listing added features',
	}),
	Changed: msg`Changed`,
	Deprecated: msg`Deprecated`,
	Removed: msg`Removed`,
	Fixed: msg`Fixed`,
	Security: msg`Security`,
} as const satisfies Record<ChangelogSectionKind, MessageDescriptor>;

export function describeSectionKind(
	kind: ChangelogSectionKind,
	i18n: I18n
): string {
	return i18n._(SECTION_KIND_LABELS[kind]);
}
