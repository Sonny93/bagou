import vine from '@vinejs/vine';

import { correctionSideField } from '#corrections/validators/correction_side_field';

export const addCorrectionValidator = vine.create({
	heard: correctionSideField(),
	written: correctionSideField().notSameAs('heard'),
});
