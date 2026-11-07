import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import type { CleanupQuality } from '~/shared/cleanup_quality';

export const CLEANUP_QUALITY_LABELS = {
	standard: msg`Standard`,
	precise: msg`Precise`,
} as const satisfies Record<CleanupQuality, MessageDescriptor>;
