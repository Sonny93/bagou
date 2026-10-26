import Factory from '@adonisjs/lucid/factories';

import { UserFactory } from '#database/factories/user_factory';
import Transcript from '#transcription_history/transcript';

export const TranscriptFactory = Factory.define(Transcript, ({ faker }) => ({
	rawText: faker.lorem.sentence(),
	cleanedText: faker.lorem.sentence(),
}))
	.relation('user', () => UserFactory)
	.build();
