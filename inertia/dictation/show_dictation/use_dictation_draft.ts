import { useCallback, useRef, useState } from 'react';

import {
	insertSegment,
	type DraftSelection,
} from '~/dictation/core/dictation_draft';

type Draft = {
	text: string;
	selection: DraftSelection;
};

const EMPTY_DRAFT: Draft = { text: '', selection: { start: 0, end: 0 } };

type UseDictationDraftReturn = {
	text: string;
	selection: DraftSelection;
	edit: (text: string, selection: DraftSelection) => void;
	select: (selection: DraftSelection) => void;
	insert: (segment: string) => string;
	clear: () => void;
};

/**
 * The editable text the dictated segments are inserted into, with the
 * selection where the next segment lands. `insert` returns the new draft text
 * synchronously, so the caller can use it before React re-renders.
 */
export function useDictationDraft(): UseDictationDraftReturn {
	const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
	const draftRef = useRef(draft);

	const update = useCallback((next: Draft) => {
		draftRef.current = next;
		setDraft(next);
	}, []);

	const edit = useCallback(
		(text: string, selection: DraftSelection) => update({ text, selection }),
		[update]
	);

	const select = useCallback(
		(selection: DraftSelection) =>
			update({ text: draftRef.current.text, selection }),
		[update]
	);

	const insert = useCallback(
		(segment: string) => {
			const { text, selection } = draftRef.current;
			const insertion = insertSegment(text, selection, segment);
			update({
				text: insertion.text,
				selection: { start: insertion.caret, end: insertion.caret },
			});
			return insertion.text;
		},
		[update]
	);

	const clear = useCallback(() => update(EMPTY_DRAFT), [update]);

	return {
		text: draft.text,
		selection: draft.selection,
		edit,
		select,
		insert,
		clear,
	};
}
