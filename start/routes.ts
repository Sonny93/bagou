import router from '@adonisjs/core/services/router';

import { controllers } from '#generated/controllers';

router
	.get('/', [controllers.dictation.ShowDictation, 'render'])
	.as('dictation.show_dictation');
