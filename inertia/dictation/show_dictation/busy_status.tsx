type BusyStatusProps = {
	label: string;
};

export const BusyStatus = ({ label }: Readonly<BusyStatusProps>) => (
	<output className="flex min-w-0 items-center gap-2 text-sm text-muted">
		<span
			className="i-tabler-loader-2 size-4 shrink-0 animate-spin motion-reduce:animate-none"
			aria-hidden
		/>
		<span className="truncate">{label}</span>
	</output>
);
