import { describe, expect, it } from 'vitest';

import { getVersionLabel } from '~/dictation/show_dictation/get_version_label';
import type { CleanupQualityOption } from '~/shared/cleanup_quality';

const QUALITIES: CleanupQualityOption[] = [
	{ value: 'standard', modelName: 'Haiku' },
	{ value: 'precise', modelName: 'Sonnet' },
];

describe('getVersionLabel', () => {
	it('should name the model when the cleaned text is shown', () => {
		expect(getVersionLabel(QUALITIES, 'precise', 'show-original')).toEqual({
			kind: 'cleaned',
			modelName: 'Sonnet',
		});
	});

	it('should say the text is the original when the toggle offers the cleaned one', () => {
		expect(getVersionLabel(QUALITIES, null, 'show-cleaned')).toEqual({
			kind: 'original',
		});
	});

	it('should return nothing when the text is neither version', () => {
		expect(getVersionLabel(QUALITIES, null, null)).toBeNull();
	});
});
