import '@minimalstuff/ui/style.css';
import 'virtual:uno.css';

import { TuyauProvider } from '@adonisjs/inertia/react';
import { ModalProvider } from '@minimalstuff/ui';
import type { PropsWithChildren } from 'react';

import { LocaleProvider } from '~/i18n/locale_provider';
import { AppUIProvider } from '~/layouts/app_ui_provider';
import { AppToaster } from '~/shared/errors/app_toaster';
import { ErrorBoundary } from '~/shared/errors/error_boundary';
import { ErrorToasts } from '~/shared/errors/error_toasts';
import { tuyauClient } from '~/shared/lib/tuyau_client';
import { useThemeColorMeta } from '~/shared/theme/use_theme_color_meta';

export function BaseLayout({ children }: Readonly<PropsWithChildren>) {
	useThemeColorMeta();

	return (
		<TuyauProvider client={tuyauClient}>
			<LocaleProvider>
				<AppUIProvider>
					<ErrorBoundary>{children}</ErrorBoundary>
					<ModalProvider />
					<AppToaster />
					<ErrorToasts />
				</AppUIProvider>
			</LocaleProvider>
		</TuyauProvider>
	);
}
