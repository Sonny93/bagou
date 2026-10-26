type BusyStatusProps = {
	label: string;
};

export const BusyStatus = ({ label }: Readonly<BusyStatusProps>) => (
	<output className="flex items-center gap-2 text-sm text-muted">
		<span
			className="i-tabler-loader-2 size-4 animate-spin motion-reduce:animate-none"
			aria-hidden
		/>
		{label}
	</output>
);
