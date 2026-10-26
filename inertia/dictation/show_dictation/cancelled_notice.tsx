import { Link } from '@adonisjs/inertia/react';

type CancelledNoticeProps = {
	hasKeptText: boolean;
};

export function CancelledNotice({
	hasKeptText,
}: Readonly<CancelledNoticeProps>) {
	if (!hasKeptText) {
		return <p className="dictation-text my-auto text-muted">Dictée annulée.</p>;
	}

	return (
		<p className="dictation-text my-auto text-muted">
			Dictée annulée. Le texte brut est gardé dans l'historique, tu peux l'y
			nettoyer.{' '}
			<Link
				route="transcription_history.show_transcripts"
				className="underline"
			>
				Ouvrir l'historique
			</Link>
		</p>
	);
}
