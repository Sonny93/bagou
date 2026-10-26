import { spawn } from 'node:child_process';

import {
	AudioConversionError,
	AudioConversionErrorCode,
} from '#stt_bench/audio_conversion_error';
import type { AudioConverter } from '#stt_bench/audio_converter';
import { PCM_AUDIO_FORMAT } from '#transcription/pcm_audio_format';

const FFMPEG_BINARY = 'ffmpeg';
const MISSING_BINARY_ERRNO = 'ENOENT';

const buildFfmpegArguments = (audioPath: string): string[] => [
	'-nostdin',
	'-v',
	'error',
	'-i',
	audioPath,
	'-ac',
	String(PCM_AUDIO_FORMAT.channelCount),
	'-ar',
	String(PCM_AUDIO_FORMAT.sampleRateHz),
	'-f',
	's16le',
	'-acodec',
	'pcm_s16le',
	'-',
];

export const convertAudioWithFfmpeg: AudioConverter = (audioPath) =>
	new Promise((resolve, reject) => {
		const ffmpeg = spawn(FFMPEG_BINARY, buildFfmpegArguments(audioPath), {
			stdio: ['ignore', 'pipe', 'ignore'],
		});
		const chunks: Buffer[] = [];
		ffmpeg.stdout.on('data', (chunk: Buffer) => chunks.push(chunk));
		ffmpeg.on('error', (error: NodeJS.ErrnoException) => {
			const isMissing = error.code === MISSING_BINARY_ERRNO;
			reject(
				new AudioConversionError(
					isMissing
						? AudioConversionErrorCode.ffmpegMissing
						: AudioConversionErrorCode.conversionFailed,
					isMissing
						? 'ffmpeg is not installed or not in PATH'
						: 'ffmpeg could not be started'
				)
			);
		});
		ffmpeg.on('close', (exitCode) => {
			if (exitCode === 0) return resolve(Buffer.concat(chunks));
			reject(
				new AudioConversionError(
					AudioConversionErrorCode.conversionFailed,
					`ffmpeg exited with code ${exitCode}`
				)
			);
		});
	});
