import { useEffect } from 'react';

const THEME_COLOR_META_SELECTOR = 'meta[name="theme-color"]';
const CANVAS_COLOR_VARIABLE = '--color-canvas';

function syncThemeColorMeta(): void {
	const canvasColor = getComputedStyle(document.documentElement)
		.getPropertyValue(CANVAS_COLOR_VARIABLE)
		.trim();
	if (canvasColor === '') return;
	document
		.querySelector(THEME_COLOR_META_SELECTOR)
		?.setAttribute('content', canvasColor);
}

/** Keeps the `theme-color` meta equal to the canvas color of the active theme. */
export function useThemeColorMeta(): void {
	useEffect(() => {
		syncThemeColorMeta();
		const observer = new MutationObserver(syncThemeColorMeta);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class'],
		});
		return () => observer.disconnect();
	}, []);
}
