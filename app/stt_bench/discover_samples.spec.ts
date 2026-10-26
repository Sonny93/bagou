import { test } from '@japa/runner';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { discoverSamples } from '#stt_bench/discover_samples';

async function createSamplesDirectory(
	fileNames: readonly string[]
): Promise<string> {
	const directory = await mkdtemp(join(tmpdir(), 'bench-samples-'));
	for (const fileName of fileNames) {
		await writeFile(join(directory, fileName), 'Bonjour le monde.\n');
	}
	return directory;
}

test.group('discoverSamples', () => {
	test('should pair audio files with their reference and report audio without one', async ({
		assert,
		cleanup,
	}) => {
		const directory = await createSamplesDirectory([
			'b_second.m4a',
			'a_first.wav',
			'a_first.txt',
			'b_second.txt',
			'orphan.ogg',
			'README.md',
			'notes.txt',
		]);
		cleanup(() => rm(directory, { recursive: true }));

		const discovered = await discoverSamples(directory);

		assert.deepEqual(
			discovered.samples.map((sample) => sample.name),
			['a_first', 'b_second']
		);
		assert.equal(
			discovered.samples[0].audioPath,
			join(directory, 'a_first.wav')
		);
		assert.equal(discovered.samples[0].referenceText, 'Bonjour le monde.');
		assert.deepEqual(discovered.namesWithoutReference, ['orphan']);
	});
});
