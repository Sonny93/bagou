export class UnknownBenchProviderError extends Error {
	override readonly name = 'UnknownBenchProviderError';
	readonly code = 'E_BENCH_UNKNOWN_PROVIDER';

	constructor(requestedName: string, knownNames: readonly string[]) {
		super(
			`Unknown provider "${requestedName}". Known providers: ${knownNames.join(', ')}`
		);
	}
}
