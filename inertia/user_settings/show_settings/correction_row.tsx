import type { Data } from '@generated/data';
import { useLingui } from '@lingui/react/macro';
import { IconButton } from '@minimalstuff/ui';

import { getCorrectionDeleteButtonId } from '~/user_settings/show_settings/correction_delete_button_id';

type CorrectionRowProps = {
	correction: Data.Corrections.Correction;
	onDelete: (id: number) => void;
};

export function CorrectionRow({
	correction,
	onDelete,
}: Readonly<CorrectionRowProps>) {
	const { t } = useLingui();
	const { id, heard, written } = correction;

	const handleDelete = () => onDelete(id);

	return (
		<li className="flex items-center justify-between gap-3 py-2">
			<p className="min-w-0 break-words">
				<span aria-hidden>
					{heard} → <strong className="font-semibold">{written}</strong>
				</span>
				<span className="sr-only">{t`Heard ${heard}, written ${written}`}</span>
			</p>
			<IconButton
				id={getCorrectionDeleteButtonId(id)}
				icon="i-tabler-trash"
				variant="ghost"
				aria-label={t`Delete ${written} for ${heard}`}
				onClick={handleDelete}
			/>
		</li>
	);
}
