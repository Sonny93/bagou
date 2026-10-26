type DockLayoutProps = {
	mic: React.ReactNode;
	status: React.ReactNode;
	end?: React.ReactNode;
};

export const DockLayout = ({ mic, status, end }: Readonly<DockLayoutProps>) => (
	<footer className="shrink-0 border-t border-line bg-surface">
		<div className="mx-auto flex min-h-16 w-full max-w-3xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2 sm:px-6">
			<div className="flex items-center gap-4">
				{mic}
				{status}
			</div>
			{end}
		</div>
	</footer>
);
