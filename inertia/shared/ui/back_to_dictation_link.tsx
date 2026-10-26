import { Link } from '@adonisjs/inertia/react';

import { cn } from '~/shared/lib/cn';
import { FOCUS_RING_CLASSES } from '~/shared/ui/focus_ring_classes';

export const BackToDictationLink = () => (
	<Link
		route="dictation.show_dictation"
		className={cn(
			'inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-muted transition-colors hover:bg-line/60 hover:text-ink',
			FOCUS_RING_CLASSES
		)}
	>
		<span className="i-tabler-arrow-left size-4" aria-hidden />
		Dictée
	</Link>
);
