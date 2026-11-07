import { createContext } from 'react';

import type {
	CleanupQuality,
	CleanupQualityOption,
} from '~/shared/cleanup_quality';

export type RecleanOptions = {
	qualities: CleanupQualityOption[];
	savedQuality: CleanupQuality;
};

export const RecleanOptionsContext = createContext<RecleanOptions>({
	qualities: [],
	savedQuality: 'standard',
});
