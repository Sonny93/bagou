export const DRAFT_TEXTAREA_ID = 'dictation-draft';

/** Puts the focus back in the draft, when it is on the page. */
export function focusDraftTextarea(): void {
	document.getElementById(DRAFT_TEXTAREA_ID)?.focus();
}
