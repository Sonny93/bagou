import type { ReactNode } from 'react';

type PreviewTextBlockProps = {
	label: string;
	children: ReactNode;
};

export const PreviewTextBlock = ({
	label,
	children,
}: Readonly<PreviewTextBlockProps>) => (
	<section className="flex min-w-0 flex-col gap-1.5">
		<h4 className="text-sm font-medium text-muted">{label}</h4>
		<p className="whitespace-pre-wrap">{children}</p>
	</section>
);
