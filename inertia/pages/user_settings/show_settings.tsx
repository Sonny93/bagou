import type { Data } from '@generated/data';
import { Trans } from '@lingui/react/macro';

import { AppHeader } from '~/shared/ui/app_header';
import { AppThemeToggle } from '~/shared/ui/app_theme_toggle';
import { BackToDictationLink } from '~/shared/ui/back_to_dictation_link';
import { SettingsForm } from '~/user_settings/show_settings/settings_form';
import type { SettingsLimits } from '~/user_settings/show_settings/settings_limits';

type ShowSettingsProps = {
	settings: Data.UserSettings;
	limits: SettingsLimits;
	options: {
		dictationLanguages: Data.UserSettings['dictationLanguage'][];
		interfaceLanguages: Data.UserSettings['interfaceLanguage'][];
	};
};

export default function ShowSettings({
	settings,
	limits,
	options,
}: Readonly<ShowSettingsProps>) {
	return (
		<div className="flex min-h-dvh flex-col">
			<AppHeader maxWidthClassName="max-w-xl">
				<BackToDictationLink />
				<AppThemeToggle />
			</AppHeader>
			<main className="mx-auto flex w-full max-w-xl flex-col gap-8 px-4 py-6 sm:px-6">
				<div className="flex flex-col gap-1">
					<h1 className="text-2xl font-semibold">
						<Trans>Settings</Trans>
					</h1>
					<p className="text-muted">
						<Trans>How the dictation and the interface behave for you.</Trans>
					</p>
				</div>
				<SettingsForm
					settings={settings}
					limits={limits}
					dictationLanguages={options.dictationLanguages}
					interfaceLanguages={options.interfaceLanguages}
				/>
			</main>
		</div>
	);
}
