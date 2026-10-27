import { args, BaseCommand, flags } from '@adonisjs/core/ace';
import type { CommandOptions } from '@adonisjs/core/types/ace';
import { readFile } from 'node:fs/promises';

import { parseDictationLanguage } from '#shared/parse_dictation_language';
import { UnknownDictationLanguageError } from '#shared/unknown_dictation_language_error';
import { InvalidWavFileError } from '#transcription/invalid_wav_file_error';
import { parseWav } from '#transcription/parse_wav';
import { PCM_AUDIO_FORMAT } from '#transcription/pcm_audio_format';
import { TranscriptionProviderError } from '#transcription/transcription_provider_error';
import { TranscriptionStreamService } from '#transcription/transcription_stream_service';

const DEFAULT_LANGUAGE: string = 'fr';

export default class StreamTranscription extends BaseCommand {
	static commandName = 'transcription:stream';
	static description =
		'Stream a WAV file (PCM s16le, 16 kHz, mono) through the transcription provider in real time';
	static options: CommandOptions = { startApp: true };

	@args.string({ description: 'Path to the WAV file' })
	declare filePath: string;

	@flags.string({
		description: 'Language of the audio (fr or en)',
		default: DEFAULT_LANGUAGE,
	})
	declare language: string;

	async run() {
		try {
			await this.#streamFile();
		} catch (error) {
			if (
				!(error instanceof InvalidWavFileError) &&
				!(error instanceof UnknownDictationLanguageError) &&
				!(error instanceof TranscriptionProviderError)
			) {
				throw error;
			}
			this.logger.error(`${error.code}: ${error.message}`);
			this.exitCode = 1;
		}
	}

	async #streamFile() {
		const pcm = parseWav(await readFile(this.filePath));
		const streamService = await this.app.container.make(
			TranscriptionStreamService
		);
		const result = await streamService.stream({
			language: parseDictationLanguage(this.language),
			pcm,
			chunkIntervalMs: PCM_AUDIO_FORMAT.chunkDurationMs,
			onFinal: (text) => process.stdout.write(text),
		});
		process.stdout.write('\n');
		this.logger.success(`Full text: ${result.text}`);
		this.logger.info(
			`Time to first final: ${formatMilliseconds(result.timeToFirstFinalMs)}`
		);
		this.logger.info(
			`End of audio to finish: ${formatMilliseconds(result.finishLatencyMs)}`
		);
	}
}

function formatMilliseconds(milliseconds: number | undefined): string {
	return milliseconds === undefined ? 'n/a' : `${Math.round(milliseconds)} ms`;
}
