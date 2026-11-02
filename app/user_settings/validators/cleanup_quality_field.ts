import vine from '@vinejs/vine';

import { CLEANUP_QUALITIES } from '#text_cleanup/cleanup_quality';

export const cleanupQualityField = () => vine.enum(CLEANUP_QUALITIES);
