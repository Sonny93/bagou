import { createNodeRealtimeSocket } from '#transcription/providers/mistral/create_node_realtime_socket';
import { MistralTranscriptionProvider } from '#transcription/providers/mistral/mistral_transcription_provider';

/** Shared by the container binding and the benchmark registry. */
export function createMistralTranscriptionProvider(
	apiKey: string
): MistralTranscriptionProvider {
	return new MistralTranscriptionProvider(apiKey, createNodeRealtimeSocket);
}
