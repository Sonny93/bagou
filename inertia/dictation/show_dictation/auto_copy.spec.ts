import { describe, expect, it, vi } from 'vitest';

import { createAutoCopy } from './auto_copy';

describe('createAutoCopy', () => {
	it('should copy the text while automatic copy is on', async () => {
		const copyText = vi
			.fn<(text: string) => Promise<boolean>>()
			.mockResolvedValue(true);

		const isCopied = await createAutoCopy(copyText, () => true)('Bonjour');

		expect(copyText).toHaveBeenCalledWith('Bonjour');
		expect(isCopied).toBe(true);
	});

	it('should not copy while automatic copy is off', async () => {
		const copyText = vi
			.fn<(text: string) => Promise<boolean>>()
			.mockResolvedValue(true);

		const isCopied = await createAutoCopy(copyText, () => false)('Bonjour');

		expect(copyText).not.toHaveBeenCalled();
		expect(isCopied).toBe(false);
	});

	it('should read the setting again at each copy', async () => {
		const copyText = vi
			.fn<(text: string) => Promise<boolean>>()
			.mockResolvedValue(true);
		let isEnabled = false;
		const autoCopy = createAutoCopy(copyText, () => isEnabled);

		await autoCopy('un');
		isEnabled = true;
		await autoCopy('deux');

		expect(copyText).toHaveBeenCalledTimes(1);
		expect(copyText).toHaveBeenCalledWith('deux');
	});
});
