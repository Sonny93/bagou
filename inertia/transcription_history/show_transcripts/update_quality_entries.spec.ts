import { describe, expect, it } from 'vitest';

import { updateQualityEntries } from '~/transcription_history/show_transcripts/update_quality_entries';

describe('updateQualityEntries', () => {
	it('should set the entry of a quality and keep the other one', () => {
		const entries = updateQualityEntries({ standard: 'A' }, 'precise', 'B');

		expect(entries).toEqual({ standard: 'A', precise: 'B' });
	});

	it('should replace only the entry of the given quality', () => {
		const entries = updateQualityEntries(
			{ standard: 'A', precise: 'B' },
			'precise',
			'C'
		);

		expect(entries).toEqual({ standard: 'A', precise: 'C' });
	});

	it('should remove only the entry of the given quality when the value is null', () => {
		const entries = updateQualityEntries(
			{ standard: 'A', precise: 'B' },
			'standard',
			null
		);

		expect(entries).toEqual({ precise: 'B' });
	});

	it('should not mutate the given entries', () => {
		const original = { standard: 'A' };

		updateQualityEntries(original, 'standard', null);

		expect(original).toEqual({ standard: 'A' });
	});
});
