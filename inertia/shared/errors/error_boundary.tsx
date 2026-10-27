import { Component, type ReactNode } from 'react';

import { ErrorFallback } from './error_fallback';

type ErrorBoundaryProps = {
	children: ReactNode;
};

type ErrorBoundaryState = {
	hasError: boolean;
};

const reloadPage = (): void => window.location.reload();

/** React already logs the caught error, so this only swaps the page for a fallback. */
export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	static getDerivedStateFromError(): ErrorBoundaryState {
		return { hasError: true };
	}

	override state: ErrorBoundaryState = { hasError: false };

	override render(): ReactNode {
		if (this.state.hasError) return <ErrorFallback onReload={reloadPage} />;
		return this.props.children;
	}
}
