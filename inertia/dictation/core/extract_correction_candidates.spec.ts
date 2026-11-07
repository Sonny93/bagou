import { describe, expect, it } from 'vitest';

import type { CorrectionPair } from './correction_pair';
import { extractCorrectionCandidates } from './extract_correction_candidates';

const buildPair = (heard: string, written: string): CorrectionPair => ({
	heard,
	written,
});

const buildLongDraft = (wordCount: number, wordPrefix = 'word'): string =>
	Array.from({ length: wordCount }, (_, index) => `${wordPrefix}${index}`).join(
		' '
	);

describe('extractCorrectionCandidates', () => {
	it('should return the substituted words when a multi-word heard form becomes one word', () => {
		const candidates = extractCorrectionCandidates(
			'use the vox trale model',
			'use the Voxtral model',
			[]
		);

		expect(candidates).toEqual([buildPair('vox trale', 'Voxtral')]);
	});

	it('should return the substitution when two similar single words differ', () => {
		const candidates = extractCorrectionCandidates(
			'ask cloud to help',
			'ask Claude to help',
			[]
		);

		expect(candidates).toEqual([buildPair('cloud', 'Claude')]);
	});

	it('should return every correction when one diff holds several substitutions', () => {
		const candidates = extractCorrectionCandidates(
			'ask cloud about vox trale and the poste gress database',
			'ask Claude about Voxtral and the Postgres database',
			[]
		);

		expect(candidates).toEqual([
			buildPair('cloud', 'Claude'),
			buildPair('vox trale', 'Voxtral'),
			buildPair('poste gress', 'Postgres'),
		]);
	});

	it('should return nothing when words are only inserted', () => {
		expect(
			extractCorrectionCandidates('use the model', 'use the Voxtral model', [])
		).toEqual([]);
	});

	it('should return nothing when words are only deleted', () => {
		expect(
			extractCorrectionCandidates('use the Voxtral model', 'use the model', [])
		).toEqual([]);
	});

	it('should return nothing when the texts are identical', () => {
		expect(extractCorrectionCandidates('same text', 'same text', [])).toEqual(
			[]
		);
	});

	it('should ignore a difference of case only', () => {
		expect(
			extractCorrectionCandidates('call claude now', 'call Claude now', [])
		).toEqual([]);
	});

	it('should ignore a difference of accents only', () => {
		expect(
			extractCorrectionCandidates('un cafe noir', 'un café noir', [])
		).toEqual([]);
	});

	it('should ignore a difference of punctuation only', () => {
		expect(
			extractCorrectionCandidates('hello world', 'hello, world', [])
		).toEqual([]);
		expect(extractCorrectionCandidates('well, done', 'well done', [])).toEqual(
			[]
		);
	});

	it('should ignore a difference of whitespace only when the words are the same', () => {
		expect(
			extractCorrectionCandidates('vox  trale now', 'vox trale now', [])
		).toEqual([]);
		expect(
			extractCorrectionCandidates('vox\ntrale now', 'vox trale now', [])
		).toEqual([]);
	});

	it('should return the pair when a word was split in two', () => {
		expect(
			extractCorrectionCandidates('use a i today', 'use AI today', [])
		).toEqual([buildPair('a i', 'AI')]);
		expect(
			extractCorrectionCandidates(
				'use post gres today',
				'use Postgres today',
				[]
			)
		).toEqual([buildPair('post gres', 'Postgres')]);
		expect(
			extractCorrectionCandidates('try chat gpt today', 'try ChatGPT today', [])
		).toEqual([buildPair('chat gpt', 'ChatGPT')]);
	});

	it('should trim edge punctuation from both sides when the correction ends a sentence', () => {
		const candidates = extractCorrectionCandidates(
			'it is cloud.',
			'it is Claude!',
			[]
		);

		expect(candidates).toEqual([buildPair('cloud', 'Claude')]);
	});

	it('should collapse inner whitespace when a side spans several spaces', () => {
		const candidates = extractCorrectionCandidates(
			'the vox   trale model',
			'the Voxtral model',
			[]
		);

		expect(candidates).toEqual([buildPair('vox trale', 'Voxtral')]);
	});

	it('should skip a pair when the words are too different', () => {
		expect(
			extractCorrectionCandidates('this is very good', 'this is great', [])
		).toEqual([]);
	});

	it('should skip a single-word heard form of two characters or fewer', () => {
		expect(
			extractCorrectionCandidates('go to ai now', 'go to AWS now', [])
		).toEqual([]);
		expect(
			extractCorrectionCandidates('say ok now', 'say OKR now', [])
		).toEqual([]);
	});

	it('should skip a side of more than three words', () => {
		expect(
			extractCorrectionCandidates(
				'the one two three four end',
				'the onetwothreefour end',
				[]
			)
		).toEqual([]);
	});

	it('should accept a side of exactly three words', () => {
		const candidates = extractCorrectionCandidates(
			'use poste gress ql daily',
			'use PostgreSQL daily',
			[]
		);

		expect(candidates).toEqual([buildPair('poste gress ql', 'PostgreSQL')]);
	});

	it('should skip a side of more than sixty characters', () => {
		const longWord = 'a'.repeat(61);

		expect(
			extractCorrectionCandidates(
				`see ${longWord} end`,
				`see ${longWord}b end`,
				[]
			)
		).toEqual([]);
	});

	it('should exclude a known pair regardless of case on both sides', () => {
		const knownPairs = [buildPair('CLOUD', 'claude')];

		expect(
			extractCorrectionCandidates('ask cloud now', 'ask Claude now', knownPairs)
		).toEqual([]);
	});

	it('should keep a pair when only one side matches a known pair', () => {
		const knownPairs = [buildPair('cloud', 'Cloudy')];

		expect(
			extractCorrectionCandidates('ask cloud now', 'ask Claude now', knownPairs)
		).toEqual([buildPair('cloud', 'Claude')]);
	});

	it('should return a pair once when it occurs several times', () => {
		const candidates = extractCorrectionCandidates(
			'cloud is here and cloud is there',
			'Claude is here and claude is there',
			[]
		);

		expect(candidates).toEqual([buildPair('cloud', 'Claude')]);
	});

	it('should return nothing when a large paste replaces the draft', () => {
		const baseline = buildLongDraft(200);
		const current = buildLongDraft(200, 'other');

		expect(extractCorrectionCandidates(baseline, current, [])).toEqual([]);
	});

	it('should return nothing when two versions of a long text differ everywhere', () => {
		const baseline = buildLongDraft(4500, 'alpha');
		const current = buildLongDraft(4500, 'omega');

		expect(extractCorrectionCandidates(baseline, current, [])).toEqual([]);
	});

	it('should find the corrections in a long draft with few edits', () => {
		const filler = buildLongDraft(4500);
		const baseline = `${filler} ask cloud and vox trale ${filler}`;
		const current = `${filler} ask Claude and Voxtral ${filler}`;

		expect(extractCorrectionCandidates(baseline, current, [])).toEqual([
			buildPair('cloud', 'Claude'),
			buildPair('vox trale', 'Voxtral'),
		]);
	});

	it('should treat an apostrophe as a word boundary when the correction follows an elision', () => {
		const candidates = extractCorrectionCandidates(
			"on utilise l'api demain",
			"on utilise l'API demain",
			[]
		);

		expect(candidates).toEqual([]);
	});

	it('should return only the word after the elision when the apostrophe prefix is unchanged', () => {
		const candidates = extractCorrectionCandidates(
			"on appelle l'apie demain",
			"on appelle l'API demain",
			[]
		);

		expect(candidates).toEqual([buildPair('apie', 'API')]);
	});
});
