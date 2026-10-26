import { useState } from 'react';

type UseEditedTextReturn = readonly [
	editedText: string,
	setEditedText: (text: string) => void,
];

/** Editable copy of `sourceText`, reset whenever the source text changes. */
export function useEditedText(sourceText: string): UseEditedTextReturn {
	const [editedText, setEditedText] = useState(sourceText);
	const [trackedSourceText, setTrackedSourceText] = useState(sourceText);

	if (sourceText !== trackedSourceText) {
		setTrackedSourceText(sourceText);
		setEditedText(sourceText);
	}

	return [editedText, setEditedText];
}
