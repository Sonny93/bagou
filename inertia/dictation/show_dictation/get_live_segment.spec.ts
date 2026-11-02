import { describe, expect, it } from 'vitest';

import type { DictationState } from '~/dictation/core/dictation_state';
import { getLiveSegment } from '~/dictation/show_dictation/get_live_segment';

describe('getLiveSegment', () => {
	it('should be empty while connecting', () => {
		expect(getLiveSegment({ status: 'connecting' })).toEqual({
			committedText: '',
			partialText: '',
		});
	});

	it('should be empty while re-cleaning so the draft stays read-only', () => {
		expect(getLiveSegment({ status: 'recleaning' })).toEqual({
			committedText: '',
			partialText: '',
		});
	});

	it('should expose the dictated text while recording', () => {
		const state: DictationState = {
			status: 'recording',
			committedText: 'Bonjour',
			partialText: ' le mon',
			startedAt: 0,
		};

		expect(getLiveSegment(state)).toEqual(state);
	});

	it('should expose the raw text while cleaning', () => {
		expect(
			getLiveSegment({ status: 'cleaning', rawText: 'Bonjour', progress: 0 })
		).toEqual({
			committedText: 'Bonjour',
			partialText: '',
		});
	});

	it('should be null when no segment is live', () => {
		expect(getLiveSegment({ status: 'idle' })).toBeNull();
		expect(getLiveSegment({ status: 'done', isCleaned: true })).toBeNull();
	});
});
