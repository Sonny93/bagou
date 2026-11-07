import { BaseTransformer } from '@adonisjs/core/transformers';

import type Correction from '#corrections/correction';

export default class CorrectionTransformer extends BaseTransformer<Correction> {
	toObject() {
		return {
			id: this.resource.id,
			heard: this.resource.heard,
			written: this.resource.written,
		};
	}
}
