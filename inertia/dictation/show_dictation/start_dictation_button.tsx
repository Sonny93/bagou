import { useEffect, useRef } from 'react';

type StartDictationButtonProps = {
	onStart: () => void;
};

export function StartDictationButton({
	onStart,
}: Readonly<StartDictationButtonProps>) {
	const buttonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		buttonRef.current?.focus();
	}, []);

	return (
		<div className="flex flex-1 items-center justify-center py-8">
			<button
				ref={buttonRef}
				type="button"
				onClick={onStart}
				className="flex size-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500"
			>
				<span className="i-tabler-microphone size-12" aria-hidden />
				<span className="px-4 text-center text-sm font-medium">
					Démarrer la dictée
				</span>
			</button>
		</div>
	);
}
