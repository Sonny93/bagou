type DockLayoutProps = {
	mic: React.ReactNode;
	status: React.ReactNode;
	end?: React.ReactNode;
};

export const DockLayout = ({ mic, status, end }: Readonly<DockLayoutProps>) => (
	<footer className="shrink-0 border-t border-line bg-surface">
		<div className="mx-auto flex min-h-16 w-full max-w-3xl items-center justify-between gap-4 px-4 py-2 sm:px-6">
			<div className="flex min-w-0 flex-1 items-center gap-4">
				{mic}
				{status}
			</div>
			{end && <div className="shrink-0">{end}</div>}
		</div>
	</footer>
);
