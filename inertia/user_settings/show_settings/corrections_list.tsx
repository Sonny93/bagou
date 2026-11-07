import type { Data } from '@generated/data';
import { Trans } from '@lingui/react/macro';

import { CorrectionRow } from '~/user_settings/show_settings/correction_row';

type CorrectionsListProps = {
	corrections: readonly Data.Corrections.Correction[];
	onDelete: (id: number) => void;
};

export function CorrectionsList({
	corrections,
	onDelete,
}: Readonly<CorrectionsListProps>) {
	if (corrections.length === 0) {
		return (
			<p className="text-muted">
				<Trans>No corrections yet.</Trans>
			</p>
		);
	}

	return (
		<ul className="m-0 flex list-none flex-col divide-y divide-line p-0">
			{corrections.map((correction) => (
				<CorrectionRow
					key={correction.id}
					correction={correction}
					onDelete={onDelete}
				/>
			))}
		</ul>
	);
}
