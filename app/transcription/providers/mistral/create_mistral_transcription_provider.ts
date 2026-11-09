import { MistralTranscriptionProvider } from '#transcription/providers/mistral/mistral_transcription_provider';
import { createNodeRealtimeSocket } from '#transcription/realtime_socket/create_node_realtime_socket';

/** Shared by the container binding and the benchmark registry. */
export function createMistralTranscriptionProvider(
	apiKey: string
): MistralTranscriptionProvider {
	return new MistralTranscriptionProvider(apiKey, createNodeRealtimeSocket);
}
