import { test } from '@japa/runner';

import { compareVersions } from '#changelog/compare_versions';

test.group('compareVersions', () => {
	test('should return 0 when the versions are equal', ({ assert }) => {
		assert.equal(compareVersions('1.2.3', '1.2.3'), 0);
	});

	test('should return -1 when the first version is older', ({ assert }) => {
		assert.equal(compareVersions('1.2.3', '1.2.4'), -1);
		assert.equal(compareVersions('1.2.3', '1.3.0'), -1);
		assert.equal(compareVersions('1.2.3', '2.0.0'), -1);
	});

	test('should return 1 when the first version is newer', ({ assert }) => {
		assert.equal(compareVersions('1.2.4', '1.2.3'), 1);
		assert.equal(compareVersions('1.3.0', '1.2.9'), 1);
		assert.equal(compareVersions('2.0.0', '1.9.9'), 1);
	});

	test('should compare each part as a number', ({ assert }) => {
		assert.equal(compareVersions('1.10.0', '1.9.0'), 1);
		assert.equal(compareVersions('1.2.10', '1.2.9'), 1);
		assert.equal(compareVersions('10.0.0', '9.0.0'), 1);
	});

	test('should return null when a version is unparseable', ({ assert }) => {
		assert.isNull(compareVersions('1.2', '1.2.3'));
		assert.isNull(compareVersions('1.2.3', 'abc'));
		assert.isNull(compareVersions('1.2.3-beta.1', '1.2.3'));
		assert.isNull(compareVersions('v1.2.3', '1.2.3'));
		assert.isNull(compareVersions('1.2.3\n', '1.2.3'));
		assert.isNull(compareVersions('', ''));
	});
});
