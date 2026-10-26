import { UnknownBenchProviderError } from '#stt_bench/unknown_bench_provider_error';

const ALL_PROVIDERS_SELECTION = 'all';

/**
 * `all` selects every registered name; no selection falls back to the
 * provider bound in the container; anything else must be registered.
 */
export function selectProviderNames(options: {
	requestedName: string | undefined;
	boundName: string;
	registeredNames: readonly string[];
}): string[] {
	const { requestedName, boundName, registeredNames } = options;
	if (requestedName === ALL_PROVIDERS_SELECTION) return [...registeredNames];
	const selectedName = requestedName ?? boundName;
	if (!registeredNames.includes(selectedName)) {
		throw new UnknownBenchProviderError(selectedName, registeredNames);
	}
	return [selectedName];
}
