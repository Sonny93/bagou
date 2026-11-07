import { useCallback, useRef, useState } from 'react';

export type RowStatus =
	| 'remembering'
	| 'dismissing'
	| 'remembered'
	| 'dismissed';

type RowStatuses = ReadonlyMap<string, RowStatus>;

const DONE_STATUSES: ReadonlySet<RowStatus> = new Set([
	'remembered',
	'dismissed',
]);

type UseRowStatusesReturn = {
	statuses: RowStatuses;
	setStatus: (key: string, status: RowStatus | null) => void;
	getResolvedKeys: () => ReadonlySet<string>;
};

/** What each row of the review is going through, by row key; a row with no status is waiting for a decision. */
export function useRowStatuses(): UseRowStatusesReturn {
	const [statuses, setStatuses] = useState<RowStatuses>(new Map());
	const statusesRef = useRef(statuses);

	const setStatus = useCallback((key: string, status: RowStatus | null) => {
		const next = new Map(statusesRef.current);
		if (status === null) next.delete(key);
		else next.set(key, status);
		statusesRef.current = next;
		setStatuses(next);
	}, []);

	const getResolvedKeys = useCallback(
		(): ReadonlySet<string> =>
			new Set(
				[...statusesRef.current]
					.filter(([, status]) => DONE_STATUSES.has(status))
					.map(([key]) => key)
			),
		[]
	);

	return { statuses, setStatus, getResolvedKeys };
}
