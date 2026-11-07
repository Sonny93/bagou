import { Spinner } from '@minimalstuff/ui';

type BusyStatusProps = {
	label: string;
};

export const BusyStatus = ({ label }: Readonly<BusyStatusProps>) => (
	<Spinner
		size="sm"
		label={label}
		className="min-w-0 text-muted"
		iconClassName="shrink-0"
		labelClassName="truncate"
	/>
);
