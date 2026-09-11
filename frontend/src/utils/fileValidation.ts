export const MAX_AUDIO_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB
export const MAX_MEDIA_FILE_SIZE_BYTES = MAX_AUDIO_FILE_SIZE_BYTES;

export const SUPPORTED_MEDIA_EXTENSIONS = ['mp3', 'wav', 'm4a', 'mp4', 'mov'] as const;
export const SUPPORTED_AUDIO_EXTENSIONS = SUPPORTED_MEDIA_EXTENSIONS;
export type SupportedMediaExtension = (typeof SUPPORTED_MEDIA_EXTENSIONS)[number];
export type SupportedAudioExtension = SupportedMediaExtension;

export const SUPPORTED_MIME_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
  'audio/m4a',
  'audio/x-m4a',
  'audio/mp4',
  'audio/x-mp4',
  'audio/aac',
  'video/mp4',
  'video/quicktime',
  'video/x-m4v',
] as const;

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export interface TitleValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates that an audio or video file matches size, extension, and MIME constraints.
 */
export function validateAudioFile(file: File | null | undefined): FileValidationResult {
  if (!file) {
    return { valid: false, error: 'Please select an audio or video file to upload.' };
  }

  if (file.size === 0) {
    return { valid: false, error: 'The selected file is empty.' };
  }

  if (file.size > MAX_MEDIA_FILE_SIZE_BYTES) {
    return { valid: false, error: 'The file is too large. Maximum size is 100 MB.' };
  }

  const filename = file.name || '';
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1) {
    return {
      valid: false,
      error: 'Unsupported file type. Please upload an MP3, WAV, M4A, MP4, or MOV file.',
    };
  }

  const extension = filename.slice(lastDotIndex + 1).toLowerCase();
  const isSupportedExtension = (SUPPORTED_MEDIA_EXTENSIONS as readonly string[]).includes(extension);

  if (!isSupportedExtension) {
    return {
      valid: false,
      error: 'Unsupported file type. Please upload an MP3, WAV, M4A, MP4, or MOV file.',
    };
  }

  // Check MIME type as secondary signal if present (some browsers might send empty string or generic application/octet-stream)
  const mime = (file.type || '').toLowerCase();
  if (mime && !(SUPPORTED_MIME_TYPES as readonly string[]).includes(mime) && mime !== 'application/octet-stream') {
    // If MIME type explicitly states an unsupported type (e.g. application/pdf, image/png)
    if (!mime.startsWith('audio/') && !mime.startsWith('video/')) {
      return {
        valid: false,
        error: 'Unsupported file type. Please upload an MP3, WAV, M4A, MP4, or MOV file.',
      };
    }
  }

  return { valid: true };
}

export const validateMediaFile = validateAudioFile;

/**
 * Validates meeting title (required, 1-200 characters).
 */
export function validateMeetingTitle(title: string | null | undefined): TitleValidationResult {
  if (!title || !title.trim()) {
    return { valid: false, error: 'Please enter a meeting title.' };
  }

  const trimmed = title.trim();
  if (trimmed.length > 200) {
    return { valid: false, error: 'Meeting title must be 200 characters or fewer.' };
  }

  return { valid: true };
}
