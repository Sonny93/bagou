type TranscriptSearchInputProps = {
	value: string;
	onChange: (value: string) => void;
};

export function TranscriptSearchInput({
	value,
	onChange,
}: Readonly<TranscriptSearchInputProps>) {
	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
		onChange(event.target.value);

	return (
		<div className="relative">
			<span
				className="i-tabler-search pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
				aria-hidden
			/>
			<input
				type="search"
				aria-label="Rechercher dans l'historique"
				placeholder="Rechercher une dictée"
				value={value}
				onChange={handleChange}
				className="h-10 w-full rounded-xl border border-line bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600 dark:focus-visible:outline-accent-400"
			/>
		</div>
	);
}
