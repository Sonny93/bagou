/**
 * Moves focus to the page `main`, so it does not fall back to `body` when the
 * focused control disappears.
 */
export function focusMain(): void {
	const main = document.querySelector('main');
	if (!main) return;
	if (!main.hasAttribute('tabindex')) main.tabIndex = -1;
	main.focus({ preventScroll: true });
}
