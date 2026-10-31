import { useEffect, useState } from 'react';

type UseElementWidthReturn = {
	ref: (element: HTMLElement | null) => void;
	width: number;
};

export function useElementWidth(): UseElementWidthReturn {
	const [element, setElement] = useState<HTMLElement | null>(null);
	const [width, setWidth] = useState(0);

	useEffect(() => {
		if (element === null) return;

		const observer = new ResizeObserver(([entry]) => {
			if (entry === undefined) return;
			setWidth(entry.contentRect.width);
		});
		observer.observe(element);

		return () => observer.disconnect();
	}, [element]);

	return { ref: setElement, width };
}
