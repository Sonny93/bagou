import { useLingui } from '@lingui/react/macro';
import { Drawer } from '@minimalstuff/ui';
import { useRef, useState } from 'react';

import type { ReviewItem } from '~/correction_suggestions/shared/build_review_list';
import { ReviewCountAnnouncer } from '~/correction_suggestions/show_dictation/review_count_announcer';
import { ReviewDrawerContent } from '~/correction_suggestions/show_dictation/review_drawer_content';
import { ReviewDrawerFooter } from '~/correction_suggestions/show_dictation/review_drawer_footer';
import { ReviewTrigger } from '~/correction_suggestions/show_dictation/review_trigger';
import type { CorrectionPair } from '~/dictation/core/correction_pair';
import { focusDraftTextarea } from '~/dictation/show_dictation/draft_textarea';

type DrawerPhase = 'closed' | 'open' | 'closing';

type CorrectionReviewProps = {
	items: readonly ReviewItem[];
	canReview: boolean;
	onResolved: (pair: CorrectionPair) => void;
};

/**
 * The corrections waiting for a decision: a small trigger above the dock
 * that opens them in a drawer. The trigger stays while the drawer is open or
 * closing, so the drawer gives the focus back to it, as long as something is
 * left to review: with nothing left it goes away and the focus returns to the
 * draft once the drawer has closed. It is hidden while `canReview` is false
 * because the drawer turns the global hotkeys off.
 */
export function CorrectionReview({
	items,
	canReview,
	onResolved,
}: Readonly<CorrectionReviewProps>) {
	const { t } = useLingui();
	const [phase, setPhase] = useState<DrawerPhase>('closed');
	const [rows, setRows] = useState<readonly ReviewItem[]>([]);
	const closeButtonRef = useRef<HTMLButtonElement>(null);
	const firstRememberRef = useRef<HTMLButtonElement>(null);
	const isTriggerShown = items.length > 0 && (phase !== 'closed' || canReview);

	const handleOpen = () => {
		setRows(items);
		setPhase('open');
	};

	const handleClose = () => setPhase('closing');

	const handleExited = () => {
		setPhase('closed');
		if (items.length === 0) focusDraftTextarea();
	};

	return (
		<>
			<ReviewCountAnnouncer count={items.length} />
			{isTriggerShown && (
				<ReviewTrigger count={items.length} onClick={handleOpen} />
			)}
			<Drawer
				isOpen={phase === 'open'}
				onClose={handleClose}
				onExited={handleExited}
				side="right"
				size="sm"
				initialFocusRef={firstRememberRef}
				title={t`Corrections to review`}
				footer={
					<ReviewDrawerFooter
						closeButtonRef={closeButtonRef}
						onClose={handleClose}
					/>
				}
			>
				<ReviewDrawerContent
					rows={rows}
					closeButtonRef={closeButtonRef}
					firstRememberRef={firstRememberRef}
					onResolved={onResolved}
				/>
			</Drawer>
		</>
	);
}
