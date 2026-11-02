import { i18n } from '@lingui/core';
import { describe, expect, it } from 'vitest';

import { describeSectionKind } from '~/changelog/show_changelog/describe_section_kind';

describe('describeSectionKind', () => {
	it('should label the Added kind as New', () => {
		expect(describeSectionKind('Added', i18n)).toBe('New');
	});

	it('should label the other kinds with their own name', () => {
		expect(describeSectionKind('Fixed', i18n)).toBe('Fixed');
		expect(describeSectionKind('Security', i18n)).toBe('Security');
	});
});
