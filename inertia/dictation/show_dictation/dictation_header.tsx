import { AccountMenu } from './account_menu';
import { NewDictationButton } from './new_dictation_button';
import { AppHeader } from '~/shared/ui/app_header';
import { AppThemeToggle } from '~/shared/ui/app_theme_toggle';

type DictationHeaderProps = {
	isNewDictationAvailable: boolean;
	onStartNew: () => void;
};

export const DictationHeader = ({
	isNewDictationAvailable,
	onStartNew,
}: Readonly<DictationHeaderProps>) => (
	<AppHeader>
		<NewDictationButton
			isAvailable={isNewDictationAvailable}
			onStart={onStartNew}
		/>
		<AppThemeToggle />
		<AccountMenu />
	</AppHeader>
);
