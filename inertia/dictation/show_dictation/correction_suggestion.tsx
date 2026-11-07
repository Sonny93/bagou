import { Trans, useLingui } from '@lingui/react/macro';
import { Button } from '@minimalstuff/ui';
import type { Ref } from 'react';

import type { CorrectionPair } from '~/dictation/core/correction_pair';

type CorrectionSuggestionProps = {
	pair: CorrectionPair;
	position: number;
	total: number;
	isRemembering: boolean;
	rememberButtonRef: Ref<HTMLButtonElement>;
	onRemember: () => void;
	onDismiss: () => void;
};

export function CorrectionSuggestion({
	pair,
	position,
	total,
	isRemembering,
	rememberButtonRef,
	onRemember,
	onDismiss,
}: Readonly<CorrectionSuggestionProps>) {
	const { t } = useLingui();
	const { heard, written } = pair;

	return (
		<fieldset className="m-0 mx-auto flex min-w-0 w-full max-w-3xl flex-wrap items-center justify-between gap-x-4 gap-y-2 border-0 px-4 py-2 sm:px-6">
			<legend className="sr-only">{t`Suggested correction`}</legend>
			<p className="min-w-0 text-sm [overflow-wrap:anywhere]">
				<span aria-hidden>
					{heard} → <strong className="font-semibold">{written}</strong>
				</span>
				<span className="sr-only">{t`Heard ${heard}, written ${written}`}</span>
				{total > 1 && (
					<span className="ml-2 text-muted tabular-nums">
						<Trans>
							{position} of {total}
						</Trans>
					</span>
				)}
			</p>
			<div className="flex shrink-0 gap-2">
				<Button
					ref={rememberButtonRef}
					size="sm"
					loading={isRemembering}
					aria-label={t`Remember ${written} for ${heard}`}
					onClick={onRemember}
				>
					<Trans>Remember</Trans>
				</Button>
				<Button
					size="sm"
					variant="ghost"
					disabled={isRemembering}
					aria-label={t`Dismiss ${written} for ${heard}`}
					onClick={onDismiss}
				>
					<Trans>Dismiss</Trans>
				</Button>
			</div>
		</fieldset>
	);
}
