import { CancelledNotice } from './cancelled_notice';
import { ErrorNotice } from './error_notice';
import type { DictationState } from '~/dictation/core/dictation_state';

type StageNoticeProps = {
	state: DictationState;
};

/** What went wrong with the last segment, shown above the draft that stays untouched. */
export function StageNotice({ state }: Readonly<StageNoticeProps>) {
	if (state.status === 'cancelled') {
		return (
			<div className="mb-6">
				<CancelledNotice hasKeptText={state.hasKeptText} />
			</div>
		);
	}
	if (state.status === 'error') {
		return (
			<div className="mb-6">
				<ErrorNotice message={state.message} />
			</div>
		);
	}
	return null;
}
