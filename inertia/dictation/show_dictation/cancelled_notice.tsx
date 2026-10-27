import { Link } from '@adonisjs/inertia/react';
import { Trans } from '@lingui/react/macro';

type CancelledNoticeProps = {
	hasKeptText: boolean;
};

export function CancelledNotice({
	hasKeptText,
}: Readonly<CancelledNoticeProps>) {
	if (!hasKeptText) {
		return (
			<p className="dictation-text text-muted">
				<Trans>Dictation cancelled.</Trans>
			</p>
		);
	}

	return (
		<p className="dictation-text text-muted">
			<Trans>
				Dictation cancelled. The raw text is kept in the history, you can clean
				it there.
			</Trans>{' '}
			<Link
				route="transcription_history.show_transcripts"
				className="underline"
			>
				<Trans>Open the history</Trans>
			</Link>
		</p>
	);
}
