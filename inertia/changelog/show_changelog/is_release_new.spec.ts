import { describe, expect, it } from 'vitest';

import { isReleaseNew } from '~/changelog/show_changelog/is_release_new';

describe('isReleaseNew', () => {
	it('should mark only the newest release when nothing was seen yet', () => {
		expect(
			isReleaseNew({ version: '1.4.0', index: 0, previousSeenVersion: null })
		).toBe(true);
		expect(
			isReleaseNew({ version: '1.3.0', index: 1, previousSeenVersion: null })
		).toBe(false);
	});

	it('should mark every release newer than the one last seen', () => {
		const previousSeenVersion = '1.2.0';

		expect(
			isReleaseNew({ version: '1.4.0', index: 0, previousSeenVersion })
		).toBe(true);
		expect(
			isReleaseNew({ version: '1.3.0', index: 1, previousSeenVersion })
		).toBe(true);
		expect(
			isReleaseNew({ version: '1.2.0', index: 2, previousSeenVersion })
		).toBe(false);
		expect(
			isReleaseNew({ version: '1.1.0', index: 3, previousSeenVersion })
		).toBe(false);
	});

	it('should mark nothing when the version last seen is unparseable', () => {
		expect(
			isReleaseNew({
				version: '1.4.0',
				index: 0,
				previousSeenVersion: 'garbage',
			})
		).toBe(false);
	});
});
