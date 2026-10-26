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
	const handleAutoStartChange = (event: React.ChangeEvent<HTMLInputElement>) =>
		onAutoStartChange(event.target.checked);

	return (
		<AppHeader>
			<Switch
				label="Démarrage auto"
				title="Démarre la dictée à l'ouverture, sur cet appareil"
				wrapperClassName="whitespace-nowrap"
				checked={isAutoStartEnabled}
				onChange={handleAutoStartChange}
			/>
			<AppThemeToggle />
			<AccountMenu />
		</AppHeader>
	);
}
