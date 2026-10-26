import { useCallback, useRef, useState } from 'react';

import {
	insertSegment,
	splitDraft,
	type DraftSelection,
} from '~/dictation/core/dictation_draft';
import type { DraftContext } from '~/dictation/core/draft_context';

type Draft = {
	draftId: string;
	text: string;
	selection: DraftSelection;
	cleanedText: string;
};

const createEmptyDraft = (): Draft => ({
	draftId: crypto.randomUUID(),
	text: '',
	selection: { start: 0, end: 0 },
	cleanedText: '',
});

type UseDictationDraftReturn = {
	draftId: string;
	text: string;
	selection: DraftSelection;
	cleanedText: string;
	edit: (text: string, selection: DraftSelection) => void;
	select: (selection: DraftSelection) => void;
	insert: (segment: string) => string;
	replace: (text: string) => string;
	getContext: () => DraftContext;
	clear: () => void;
};

/**
 * The editable text the dictated segments are inserted into, with the
 * selection where the next segment lands. It has an id, shared with the server
 * so the whole draft is one history entry; `clear` starts a new draft with a
 * new id. `replace` takes the draft cleaned by the server, which is then also
 * the text the history holds (`cleanedText`). `insert` and `replace` return the new draft text synchronously, so
 * the caller can use it before React re-renders; `getContext` reads the
 * current draft the same way.
 */
export function useDictationDraft(): UseDictationDraftReturn {
	const [draft, setDraft] = useState<Draft>(createEmptyDraft);
	const draftRef = useRef(draft);

	const update = useCallback((next: Draft) => {
		draftRef.current = next;
		setDraft(next);
	}, []);

	const edit = useCallback(
		(text: string, selection: DraftSelection) =>
			update({ ...draftRef.current, text, selection }),
		[update]
	);

	const select = useCallback(
		(selection: DraftSelection) => update({ ...draftRef.current, selection }),
		[update]
	);

	const insert = useCallback(
		(segment: string) => {
			const { text, selection } = draftRef.current;
			const insertion = insertSegment(text, selection, segment);
			update({
				...draftRef.current,
				text: insertion.text,
				selection: { start: insertion.caret, end: insertion.caret },
			});
			return insertion.text;
		},
		[update]
	);

	const replace = useCallback(
		(text: string) => {
			update({
				...draftRef.current,
				text,
				selection: { start: text.length, end: text.length },
				cleanedText: text,
			});
			return text;
		},
		[update]
	);

	const getContext = useCallback((): DraftContext => {
		const { draftId, text, selection } = draftRef.current;
		const { textBefore, textAfter } = splitDraft(text, selection, '');
		return { draftId, textBefore, textAfter };
	}, []);

	const clear = useCallback(() => update(createEmptyDraft()), [update]);

	return {
		draftId: draft.draftId,
		text: draft.text,
		selection: draft.selection,
		cleanedText: draft.cleanedText,
		edit,
		select,
		insert,
		replace,
		getContext,
		clear,
	};
}
