import router from '@adonisjs/core/services/router';

import { controllers } from '#generated/controllers';
import { middleware } from '#start/kernel';
import { cleanupThrottle } from '#start/limiter';

router
	.group(() => {
		router
			.get('/', [controllers.dictation.ShowDictation, 'render'])
			.as('dictation.show_dictation');
		router
			.group(() => {
				router
					.get('/', [
						controllers.transcriptionHistory.ShowTranscripts,
						'render',
					])
					.as('transcription_history.show_transcripts');
				router
					.delete('/:id', [
						controllers.transcriptionHistory.DeleteTranscript,
						'execute',
					])
					.where('id', router.matchers.number())
					.as('transcription_history.delete_transcript');
				router
					.post('/:id/clean', [
						controllers.transcriptionHistory.CleanTranscript,
						'execute',
					])
					.where('id', router.matchers.number())
					.use(cleanupThrottle)
					.as('transcription_history.clean_transcript');
				router
					.delete('/', [
						controllers.transcriptionHistory.DeleteTranscripts,
						'execute',
					])
					.as('transcription_history.delete_transcripts');
			})
			.prefix('/history');
		router
			.post('/logout', [controllers.auth.Logout, 'execute'])
			.as('auth.logout');
	})
	.middleware([middleware.auth()]);
