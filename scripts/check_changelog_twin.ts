import { readFileSync } from 'node:fs';

import { findEntryCountMismatches } from '#scripts/find_entry_count_mismatches.ts';

const mismatches = findEntryCountMismatches(
	readFileSync('CHANGELOG.md', 'utf8'),
	readFileSync('CHANGELOG.fr.md', 'utf8')
);

if (mismatches.length > 0) {
	console.error('CHANGELOG.fr.md is out of sync with CHANGELOG.md:');
	for (const mismatch of mismatches) console.error(`- ${mismatch}`);
	console.error('Translate every entry, then run the release again.');
	process.exitCode = 1;
}
