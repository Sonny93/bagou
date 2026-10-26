type TranscriptEmptyStateProps = {
	isSearching: boolean;
};

export const TranscriptEmptyState = ({
	isSearching,
}: Readonly<TranscriptEmptyStateProps>) => (
	<p className="rounded-xl border border-line bg-surface px-4 py-8 text-center text-muted">
		{isSearching ? 'Aucun résultat.' : 'Aucune dictée pour le moment.'}
	</p>
);
