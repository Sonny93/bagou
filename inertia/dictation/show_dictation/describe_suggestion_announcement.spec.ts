import { i18n } from '@lingui/core';
import { describe, expect, it } from 'vitest';

import { describeSuggestionAnnouncement } from '~/dictation/show_dictation/describe_suggestion_announcement';

const PAIR = { heard: 'vox trale', written: 'Voxtral' };

describe('describeSuggestionAnnouncement', () => {
	it('should name the pair alone when it is the only suggestion', () => {
		expect(describeSuggestionAnnouncement(PAIR, 1, i18n)).toBe(
			'Correction suggested: remember Voxtral for vox trale?'
		);
	});

	it('should name the position when several suggestions wait', () => {
		expect(describeSuggestionAnnouncement(PAIR, 3, i18n)).toBe(
			'Correction suggested (1 of 3): remember Voxtral for vox trale?'
		);
	});
});
