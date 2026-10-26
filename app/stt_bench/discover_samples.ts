import { readdir, readFile } from 'node:fs/promises';
import { extname, join, parse } from 'node:path';

import type { BenchSample } from '#stt_bench/bench_sample';
import type { DiscoveredSamples } from '#stt_bench/discovered_samples';

const AUDIO_EXTENSIONS: ReadonlySet<string> = new Set([
	'.wav',
	'.m4a',
	'.ogg',
	'.opus',
	'.webm',
	'.mp3',
	'.flac',
	'.aac',
	'.mp4',
]);
const REFERENCE_EXTENSION = '.txt';

/**
 * Pairs every `<name>.<audio>` with its `<name>.txt` reference. Audio without
 * a reference is reported by name instead of being returned; other files are
 * ignored. Samples come back sorted by name.
 */
export async function discoverSamples(
	directory: string
): Promise<DiscoveredSamples> {
	const fileNames = (await readdir(directory)).toSorted();
	const referenceNames = new Set(
		fileNames
			.filter((fileName) => extname(fileName) === REFERENCE_EXTENSION)
			.map((fileName) => parse(fileName).name)
	);
	const audioFileNames = fileNames.filter((fileName) =>
		AUDIO_EXTENSIONS.has(extname(fileName).toLowerCase())
	);

	const samples: BenchSample[] = [];
	const namesWithoutReference: string[] = [];
	for (const audioFileName of audioFileNames) {
		const { name } = parse(audioFileName);
		if (!referenceNames.has(name)) {
			namesWithoutReference.push(name);
			continue;
		}
		samples.push({
			name,
			audioPath: join(directory, audioFileName),
			referenceText: (
				await readFile(join(directory, `${name}${REFERENCE_EXTENSION}`), 'utf8')
			).trim(),
		});
	}
	return { samples, namesWithoutReference };
}
