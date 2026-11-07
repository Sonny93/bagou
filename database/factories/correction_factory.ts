import Factory from '@adonisjs/lucid/factories';

import Correction from '#corrections/correction';

export const CorrectionFactory = Factory.define(Correction, ({ faker }) => ({
	heard: faker.string.alpha(12),
	written: faker.string.alpha(12),
})).build();
