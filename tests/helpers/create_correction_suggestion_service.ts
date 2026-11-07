import { CorrectionSuggestionService } from '#correction_suggestions/correction_suggestion_service';
import { Clock } from '#shared/clock';
import { createRecordingLogger } from '#tests/helpers/create_recording_logger';

export function createCorrectionSuggestionService(
	clock: Clock = new Clock()
): CorrectionSuggestionService {
	return new CorrectionSuggestionService(createRecordingLogger().logger, clock);
}
