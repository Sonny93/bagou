import { describe, expect, it } from 'vitest';

import {
	dictationReducer,
	INITIAL_DICTATION_STATE,
	type DictationEvent,
	type DictationState,
} from './dictation_state';

const STARTED_AT = 1000;

const recording = (committedText = '', partialText = ''): DictationState => ({
	status: 'recording',
	committedText,
	partialText,
	startedAt: STARTED_AT,
});

const finishing: DictationState = {
	status: 'finishing',
	committedText: 'Bonjour',
	partialText: '',
};

const cleaning: DictationState = { status: 'cleaning', rawText: 'bonjour' };

const reduce = (
	state: DictationState,
	...events: DictationEvent[]
): DictationState => events.reduce(dictationReducer, state);

describe('dictationReducer', () => {
	it('should walk the happy path from idle to done', () => {
		const state = reduce(
			INITIAL_DICTATION_STATE,
			{ type: 'startRequested' },
			{ type: 'recordingStarted', startedAt: STARTED_AT },
			{ type: 'finalReceived', text: 'Bonjour' },
			{ type: 'stopRequested' },
			{ type: 'finished', text: 'bonjour le monde' },
			{ type: 'cleaned', text: 'Bonjour le monde.', isCleaned: true }
		);

		expect(state).toEqual({
			status: 'done',
			text: 'Bonjour le monde.',
			isCleaned: true,
		});
	});

	it('should keep the raw text while cleaning after the dictation finished', () => {
		const state = reduce(finishing, { type: 'finished', text: 'bonjour' });

		expect(state).toEqual({ status: 'cleaning', rawText: 'bonjour' });
	});

	it('should end cleaning in done with the raw text when the cleanup is unavailable', () => {
		const state = reduce(cleaning, {
			type: 'cleaned',
			text: 'bonjour',
			isCleaned: false,
		});

		expect(state).toEqual({
			status: 'done',
			text: 'bonjour',
			isCleaned: false,
		});
	});

	it.each<DictationEvent>([
		{ type: 'cancelRequested' },
		{ type: 'failed', message: 'Oups' },
		{ type: 'startRequested' },
		{ type: 'finalReceived', text: 'late' },
		{ type: 'finished', text: 'late' },
	])('should ignore $type while cleaning', (event) => {
		expect(dictationReducer(cleaning, event)).toBe(cleaning);
	});

	it('should append every final to the committed text and keep the partial', () => {
		const state = reduce(recording('Bonjour', ' le mo'), {
			type: 'finalReceived',
			text: ' le monde',
		});

		expect(state).toMatchObject({
			committedText: 'Bonjour le monde',
			partialText: ' le mo',
		});
	});

	it('should replace the partial text, and clear it when empty', () => {
		const replaced = reduce(recording('', 'abc'), {
			type: 'partialReceived',
			text: 'abcd',
		});
		const cleared = reduce(replaced, { type: 'partialReceived', text: '' });

		expect(replaced).toMatchObject({ partialText: 'abcd' });
		expect(cleared).toMatchObject({ partialText: '' });
	});

	it('should keep the transcript visible while finishing and still accept finals', () => {
		const state = reduce(
			recording('Bonjour', ' le'),
			{ type: 'stopRequested' },
			{ type: 'finalReceived', text: ' monde' }
		);

		expect(state).toEqual({
			status: 'finishing',
			committedText: 'Bonjour monde',
			partialText: ' le',
		});
	});

	it.each<[string, DictationState]>([
		['connecting', { status: 'connecting' }],
		['recording', recording()],
		['finishing', finishing],
	])('should go to cancelled when cancelled while %s', (_name, state) => {
		expect(reduce(state, { type: 'cancelRequested' })).toEqual({
			status: 'cancelled',
		});
	});

	it.each<[string, DictationState]>([
		['connecting', { status: 'connecting' }],
		['recording', recording()],
		['finishing', finishing],
	])('should go to error when failing while %s', (_name, state) => {
		expect(reduce(state, { type: 'failed', message: 'Oups' })).toEqual({
			status: 'error',
			message: 'Oups',
		});
	});

	it.each<[string, DictationState]>([
		['done', { status: 'done', text: 'x', isCleaned: true }],
		['cancelled', { status: 'cancelled' }],
		['error', { status: 'error', message: 'm' }],
	])('should start a new dictation from %s', (_name, state) => {
		expect(reduce(state, { type: 'startRequested' })).toEqual({
			status: 'connecting',
		});
	});

	it('should ignore events that do not apply to the current state', () => {
		const done: DictationState = { status: 'done', text: 'x', isCleaned: true };
		const cancelled: DictationState = { status: 'cancelled' };
		const connecting: DictationState = { status: 'connecting' };
		const events: [DictationState, DictationEvent][] = [
			[INITIAL_DICTATION_STATE, { type: 'recordingStarted', startedAt: 1 }],
			[INITIAL_DICTATION_STATE, { type: 'cancelRequested' }],
			[connecting, { type: 'startRequested' }],
			[connecting, { type: 'finalReceived', text: 'a' }],
			[connecting, { type: 'stopRequested' }],
			[recording(), { type: 'startRequested' }],
			[recording(), { type: 'recordingStarted', startedAt: 2 }],
			[recording(), { type: 'finished', text: 'a' }],
			[cancelled, { type: 'finalReceived', text: 'late' }],
			[cancelled, { type: 'failed', message: 'late' }],
			[done, { type: 'partialReceived', text: 'late' }],
			[done, { type: 'cancelRequested' }],
			[finishing, { type: 'stopRequested' }],
			[finishing, { type: 'startRequested' }],
		];

		for (const [state, event] of events) {
			expect(dictationReducer(state, event)).toBe(state);
		}
	});
});
