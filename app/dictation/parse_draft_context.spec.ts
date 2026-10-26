import { test } from '@japa/runner';

import { parseDraftContext } from '#dictation/parse_draft_context';
import { MAX_DRAFT_TEXT_LENGTH } from '#dictation/validators/start_dictation_validator';

const DRAFT_ID = '3f0a1c7e-9d54-4b6a-8e21-5c7d9a0b4f12';

test.group('parseDraftContext', () => {
	test('should return the draft context of a valid payload', async ({
		assert,
	}) => {
		const context = await parseDraftContext({
			draftId: DRAFT_ID,
			textBefore: 'Avant.',
			textAfter: 'Après.',
		});

		assert.deepEqual(context, {
			draftId: DRAFT_ID,
			textBefore: 'Avant.',
			textAfter: 'Après.',
		});
	});

	test('should accept empty texts', async ({ assert }) => {
		const context = await parseDraftContext({
			draftId: DRAFT_ID,
			textBefore: '',
			textAfter: '',
		});

		assert.equal(context.textBefore, '');
		assert.equal(context.textAfter, '');
	});

	test('should reject a draft id that is not a uuid', async ({ assert }) => {
		await assert.rejects(
			() =>
				parseDraftContext({
					draftId: 'nope',
					textBefore: '',
					textAfter: '',
				}),
			/invalide/
		);
	});

	test('should reject a text longer than the limit', async ({ assert }) => {
		await assert.rejects(
			() =>
				parseDraftContext({
					draftId: DRAFT_ID,
					textBefore: 'a'.repeat(MAX_DRAFT_TEXT_LENGTH + 1),
					textAfter: '',
				}),
			/invalide ou trop volumineux/
		);
	});

	test('should reject a payload without texts', async ({ assert }) => {
		await assert.rejects(
			() => parseDraftContext({ draftId: DRAFT_ID }),
			/invalide/
		);
		await assert.rejects(() => parseDraftContext(undefined), /invalide/);
	});
});
