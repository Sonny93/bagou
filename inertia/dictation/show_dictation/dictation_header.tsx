import { useLingui } from '@lingui/react/macro';
import { Switch } from '@minimalstuff/ui';

import { AccountMenu } from './account_menu';
import { AppHeader } from '~/shared/ui/app_header';
import { AppThemeToggle } from '~/shared/ui/app_theme_toggle';

type DictationHeaderProps = {
	isAutoStartEnabled: boolean;
	onAutoStartChange: (isEnabled: boolean) => void;
};

export function DictationHeader({
	isAutoStartEnabled,
	onAutoStartChange,
}: Readonly<DictationHeaderProps>) {
	const { t } = useLingui();
	const handleAutoStartChange = (event: React.ChangeEvent<HTMLInputElement>) =>
		onAutoStartChange(event.target.checked);

	return (
		<AppHeader>
			<Switch
				label={t`Auto-start`}
				title={t`Starts the dictation on opening, on this device`}
				wrapperClassName="whitespace-nowrap"
				checked={isAutoStartEnabled}
				onChange={handleAutoStartChange}
			/>
			<AppThemeToggle />
			<AccountMenu />
		</AppHeader>
	);
}
