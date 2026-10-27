import type { Data } from '@generated/data';

import type { DraftContext } from './draft_context';

/** The settings a preview dictation tries on the fly: sent as is, never saved by the server. */
export type PreviewSettings = {
	dictationLanguage: Data.UserSettings['dictationLanguage'];
	vocabulary: readonly string[];
	cleanupInstructions: string;
};

/**
 * What a dictation starts from: a segment dictated into a draft, or a preview
 * of settings that touches neither the draft nor the history.
 */
export type DictationStartRequest =
	| { kind: 'draft'; context: Readonly<DraftContext> }
	| { kind: 'preview'; settings: Readonly<PreviewSettings> };
