import { AccountMenu } from '~/dictation/show_dictation/account_menu';
import { NewDictationButton } from '~/dictation/show_dictation/new_dictation_button';
import { SaveIndicator } from '~/dictation/show_dictation/save_indicator';
import type { SaveStatus } from '~/dictation/show_dictation/save_status';
import type { ExplicitSave } from '~/dictation/show_dictation/use_save_draft_text';
import { AppHeader } from '~/shared/ui/app_header';
import { AppThemeToggle } from '~/shared/ui/app_theme_toggle';

type DictationHeaderProps = {
	isNewDictationAvailable: boolean;
	onStartNew: () => void;
	saveStatus: SaveStatus;
	explicitSave: ExplicitSave | null;
};

export const DictationHeader = ({
	isNewDictationAvailable,
	onStartNew,
	saveStatus,
	explicitSave,
}: Readonly<DictationHeaderProps>) => (
	<AppHeader>
		<SaveIndicator saveStatus={saveStatus} explicitSave={explicitSave} />
		<NewDictationButton
			isAvailable={isNewDictationAvailable}
			onStart={onStartNew}
		/>
		<AppThemeToggle />
		<AccountMenu />
	</AppHeader>
);
