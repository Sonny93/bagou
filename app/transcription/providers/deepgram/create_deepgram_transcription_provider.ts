import { DeepgramTranscriptionProvider } from '#transcription/providers/deepgram/deepgram_transcription_provider';
import { createNodeRealtimeSocket } from '#transcription/realtime_socket/create_node_realtime_socket';
import type { WarningLogger } from '#transcription/warning_logger';

/** Shared by the container binding and the benchmark registry. */
export function createDeepgramTranscriptionProvider(
	apiKey: string,
	logger: WarningLogger
): DeepgramTranscriptionProvider {
	return new DeepgramTranscriptionProvider(
		apiKey,
		createNodeRealtimeSocket,
		logger
	);
}
