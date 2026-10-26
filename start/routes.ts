import router from '@adonisjs/core/services/router';

import { controllers } from '#generated/controllers';
import { middleware } from '#start/kernel';

router
	.group(() => {
		router
			.get('/', [controllers.dictation.ShowDictation, 'render'])
			.as('dictation.show_dictation');
		router
			.post('/dictation/cleanup', [
				controllers.textCleanup.CleanText,
				'execute',
			])
			.as('text_cleanup.clean_text');
		router
			.post('/logout', [controllers.auth.Logout, 'execute'])
			.as('auth.logout');
	})
	.middleware([middleware.auth()]);
