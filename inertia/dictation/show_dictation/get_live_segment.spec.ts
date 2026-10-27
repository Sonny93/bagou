import { describe, expect, it } from 'vitest';

import { getLiveSegment } from './get_live_segment';
import type { DictationState } from '~/dictation/core/dictation_state';

describe('getLiveSegment', () => {
	it('should be empty while connecting', () => {
		expect(getLiveSegment({ status: 'connecting' })).toEqual({
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
		expect(getLiveSegment({ status: 'cleaning', rawText: 'Bonjour' })).toEqual({
			committedText: 'Bonjour',
			partialText: '',
		});
	});

	it('should be null when no segment is live', () => {
		expect(getLiveSegment({ status: 'idle' })).toBeNull();
		expect(getLiveSegment({ status: 'done', isCleaned: true })).toBeNull();
	});
});
