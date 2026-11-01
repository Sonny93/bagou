import { Trans, useLingui } from '@lingui/react/macro';
import { Switch } from '@minimalstuff/ui';
import { useId } from 'react';

import {
	AUTO_COPY_PREFERENCE,
	AUTO_START_PREFERENCE,
} from '~/shared/preferences/dictation_preferences';
import { useBooleanPreference } from '~/shared/preferences/use_boolean_preference';

/**
 * Settings kept in this browser only and saved as soon as they change, so
 * they live outside the form that saves to the server.
 */
export function DeviceSettings() {
	const { t } = useLingui();
	const headingId = useId();
	const noteId = useId();
	const [isAutoStartEnabled, setAutoStartEnabled] = useBooleanPreference(
		AUTO_START_PREFERENCE
	);
	const [isAutoCopyEnabled, setAutoCopyEnabled] =
		useBooleanPreference(AUTO_COPY_PREFERENCE);

	const handleAutoStartChange = (event: React.ChangeEvent<HTMLInputElement>) =>
		setAutoStartEnabled(event.target.checked);
	const handleAutoCopyChange = (event: React.ChangeEvent<HTMLInputElement>) =>
		setAutoCopyEnabled(event.target.checked);

	return (
		<section
			aria-labelledby={headingId}
			className="flex flex-col gap-4 border-t border-line pt-6"
		>
			<div className="flex flex-col gap-1">
				<h2 id={headingId} className="text-xl font-semibold">
					<Trans>On this device</Trans>
				</h2>
				<p id={noteId} className="text-muted">
					<Trans>
						These settings apply to this browser only and are saved immediately.
					</Trans>
				</p>
			</div>
			<fieldset
				aria-labelledby={headingId}
				aria-describedby={noteId}
				className="m-0 flex min-w-0 flex-col gap-4 border-0 p-0"
			>
				<Switch
					label={t`Auto-start`}
					description={t`Starts the dictation on opening, on this device`}
					checked={isAutoStartEnabled}
					onChange={handleAutoStartChange}
				/>
				<Switch
					label={t`Copy automatically`}
					description={t`Copies the text to the clipboard after each dictation or cleanup`}
					checked={isAutoCopyEnabled}
					onChange={handleAutoCopyChange}
				/>
			</fieldset>
		</section>
	);
}
