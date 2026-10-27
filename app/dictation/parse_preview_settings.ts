import { errors } from '@vinejs/vine';

import InvalidPreviewSettingsException from '#dictation/invalid_preview_settings_exception';
import type { PreviewSettings } from '#user_settings/preview_settings';
import { toPreviewSettings } from '#user_settings/to_preview_settings';
import { previewSettingsValidator } from '#user_settings/validators/preview_settings_validator';

/** Validates one untrusted `dictation:preview` payload with the rules of the settings. */
export async function parsePreviewSettings(
	payload: unknown
): Promise<PreviewSettings> {
	try {
		return toPreviewSettings(await previewSettingsValidator.validate(payload));
	} catch (error) {
		if (error instanceof errors.E_VALIDATION_ERROR) {
			throw new InvalidPreviewSettingsException();
		}
		throw error;
	}
}
