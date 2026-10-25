import { Textarea } from '@minimalstuff/ui';

type DictationResultProps = {
	text: string;
};

/**
 * Final text, editable. The cleanup and copy actions plug in here (step 5):
 * they will take the edited text, not `text`.
 */
export const DictationResult = ({ text }: Readonly<DictationResultProps>) => (
	<Textarea
		label="Texte dicté"
		defaultValue={text}
		rows={8}
		className="text-xl leading-relaxed"
	/>
);
