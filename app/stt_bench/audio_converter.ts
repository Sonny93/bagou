/** Turns an audio file into raw PCM s16le, 16 kHz, mono. */
export type AudioConverter = (audioPath: string) => Promise<Uint8Array>;
