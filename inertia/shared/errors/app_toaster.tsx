import { useThemeStore } from '@minimalstuff/ui';
import { Toaster } from 'sonner';

export function AppToaster() {
	const { theme } = useThemeStore();

	return <Toaster theme={theme} richColors closeButton position="top-right" />;
}
