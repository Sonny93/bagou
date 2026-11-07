import { CorrectionService } from '#corrections/correction_service';
import { createRecordingLogger } from '#tests/helpers/create_recording_logger';

export function createCorrectionService(): CorrectionService {
	return new CorrectionService(createRecordingLogger().logger);
}
