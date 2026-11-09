type SkipUnconfiguredProvidersInput = {
	providerNames: readonly string[];
	isConfigured: (providerName: string) => boolean;
};

type ConfiguredProviderSplit = {
	configuredNames: string[];
	skippedNames: string[];
};

/** Splits the selection by whether each provider has its API key set. */
export function skipUnconfiguredProviders({
	providerNames,
	isConfigured,
}: Readonly<SkipUnconfiguredProvidersInput>): ConfiguredProviderSplit {
	return {
		configuredNames: providerNames.filter((name) => isConfigured(name)),
		skippedNames: providerNames.filter((name) => !isConfigured(name)),
	};
}
