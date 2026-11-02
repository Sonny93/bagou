import type { Data } from '@generated/data';
import type { I18n, MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export type CleanupQuality = Data.UserSettings['cleanupQuality'];

export type CleanupQualityOption = {
	value: CleanupQuality;
	modelName: string;
};

type CleanupQualityDescriptors = {
	label: MessageDescriptor;
	description: MessageDescriptor;
};

const CLEANUP_QUALITY_DESCRIPTORS = {
	standard: (modelName) => ({
		label: msg`Standard (${modelName})`,
		description: msg`Fast and inexpensive. May miss some agreement slips or misheard words.`,
	}),
	precise: (modelName) => ({
		label: msg`Precise (${modelName})`,
		description: msg`Catches more agreement slips and misheard words, but costs much more per dictation.`,
	}),
} as const satisfies Record<
	CleanupQuality,
	(modelName: string) => CleanupQualityDescriptors
>;

export function describeCleanupQuality(
	{ value, modelName }: Readonly<CleanupQualityOption>,
	i18n: I18n
): { value: CleanupQuality; label: string; description: string } {
	const { label, description } = CLEANUP_QUALITY_DESCRIPTORS[value](modelName);
	return { value, label: i18n._(label), description: i18n._(description) };
}
