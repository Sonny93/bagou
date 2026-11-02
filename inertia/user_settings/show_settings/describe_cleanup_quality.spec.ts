import { i18n } from '@lingui/core';
import { describe, expect, it } from 'vitest';

import { describeCleanupQuality } from '~/user_settings/show_settings/describe_cleanup_quality';

describe('describeCleanupQuality', () => {
	it('should put the model name in the label of the standard quality', () => {
		expect(
			describeCleanupQuality(
				{ value: 'standard', modelName: 'Claude Haiku 5.5' },
				i18n
			)
		).toMatchObject({
			value: 'standard',
			label: 'Standard (Claude Haiku 5.5)',
		});
	});

	it('should put the model name in the label of the precise quality', () => {
		expect(
			describeCleanupQuality(
				{ value: 'precise', modelName: 'Claude Sonnet 5.5' },
				i18n
			)
		).toMatchObject({
			value: 'precise',
			label: 'Precise (Claude Sonnet 5.5)',
		});
	});
});
