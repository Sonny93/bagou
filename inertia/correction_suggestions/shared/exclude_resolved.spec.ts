import { describe, expect, it } from 'vitest';

import { excludeResolved } from '~/correction_suggestions/shared/exclude_resolved';

const FIRST = { heard: 'Vox Tral', written: 'Voxtral' };
const SECOND = { heard: 'adonis', written: 'AdonisJS' };

describe('excludeResolved', () => {
	it('should drop the suggestions already resolved when the server still sends them, ignoring case', () => {
		const result = excludeResolved(
			[FIRST, SECOND],
			[{ heard: 'vox tral', written: 'VOXTRAL' }]
		);

		expect(result).toEqual([SECOND]);
	});

	it('should keep every suggestion when nothing was resolved', () => {
		expect(excludeResolved([FIRST, SECOND], [])).toEqual([FIRST, SECOND]);
	});
});
