import { useState, type FC, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileAudio, FileVideo, Trash2, CheckCircle2, AlertCircle, UploadCloud } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { FileDropZone } from './FileDropZone';
import { UploadProgress } from './UploadProgress';
import { api } from '../../services/api';
import { validateAudioFile, validateMeetingTitle } from '../../utils/fileValidation';
import { formatFileSize } from '../../utils/formatFileSize';
import { getFriendlyErrorMessage } from '../../utils/apiError';

export type UploadState = 'idle' | 'uploading' | 'success' | 'error';

export interface UploadCardProps {
  className?: string;
}

export const UploadCard: FC<UploadCardProps> = ({ className = '' }) => {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);

  // Validation & Server errors
  const [fileError, setFileError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const isUploading = uploadState === 'uploading';

  const handleFileSelect = (file: File) => {
    setFileError(null);
    setServerError(null);
    setSelectedFile(file);

    // Auto-populate title from filename if title is currently empty
    if (!title.trim()) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setTitle(nameWithoutExt);
    }
  };

  const handleFileError = (errorMsg: string) => {
    setFileError(errorMsg);
    setServerError(null);
  };

  const handleRemoveFile = () => {
    if (isUploading) return;
    setSelectedFile(null);
    setFileError(null);
    setServerError(null);
    setUploadProgress(0);
    setUploadState('idle');
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (titleError) {
      setTitleError(null);
    }
    if (serverError) {
      setServerError(null);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isUploading) return;

    // 1. Validate file
    const fileResult = validateAudioFile(selectedFile);
    if (!fileResult.valid) {
      setFileError(fileResult.error || 'Please select a valid audio file.');
      return;
    }

    // 2. Validate title
    const titleResult = validateMeetingTitle(title);
    if (!titleResult.valid) {
      setTitleError(titleResult.error || 'Please enter a meeting title.');
      return;
    }

    // 3. Clear errors and start upload
    setFileError(null);
    setTitleError(null);
    setServerError(null);
    setUploadState('uploading');
    setUploadProgress(0);

    try {
      const createdMeeting = await api.uploadMeeting(
        selectedFile!,
        title.trim(),
        (progress) => {
          setUploadProgress(progress);
        }
      );

      if (!createdMeeting || !createdMeeting.id) {
        throw new Error('Server returned an invalid meeting response.');
      }

      setUploadState('success');
      // Navigate to Meeting Details using the real UUID
      navigate(`/meetings/${createdMeeting.id}`);
    } catch (err: unknown) {
      console.error('Upload failed:', err);
      const friendlyMessage = getFriendlyErrorMessage(err);
      setServerError(friendlyMessage);
      setUploadState('error');
    }
  };

  return (
    <Card
      padding="lg"
      className={className}
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <form onSubmit={handleSubmit} noValidate>
        {/* Screen Reader Live Announcements */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {isUploading && 'Uploading meeting...'}
          {uploadState === 'success' && 'Meeting uploaded successfully.'}
          {uploadState === 'error' && `Upload error: ${serverError}`}
        </div>

        {/* 1. File Selection / Preview */}
        {!selectedFile ? (
          <div>
            <FileDropZone
              onFileSelect={handleFileSelect}
              onError={handleFileError}
              disabled={isUploading}
            />
            {fileError && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginTop: '0.75rem',
                  fontSize: '0.85rem',
                  color: 'var(--status-error)',
                }}
                role="alert"
              >
                <AlertCircle size={16} />
                <span>{fileError}</span>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border)',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {selectedFile.name.toLowerCase().endsWith('.mp4') ||
                  selectedFile.name.toLowerCase().endsWith('.mov') ||
                  selectedFile.type.startsWith('video/') ? (
                    <FileVideo size={22} />
                  ) : (
                    <FileAudio size={22} />
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '380px',
                    }}
                    title={selectedFile.name}
                  >
                    {selectedFile.name}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                      marginTop: '0.2rem',
                    }}
                  >
                    <span>{formatFileSize(selectedFile.size)}</span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        color: 'var(--status-success-text)',
                        fontWeight: 500,
                      }}
                    >
                      <CheckCircle2 size={13} style={{ color: 'var(--status-success)' }} />
                      Ready to upload
                    </span>
                  </div>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                icon={<Trash2 size={15} />}
                onClick={handleRemoveFile}
                disabled={isUploading}
                style={{ color: 'var(--status-error)' }}
                aria-label="Remove selected file"
              >
                Remove
              </Button>
            </div>

            {fileError && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginTop: '0.75rem',
                  fontSize: '0.85rem',
                  color: 'var(--status-error)',
                }}
                role="alert"
              >
                <AlertCircle size={16} />
                <span>{fileError}</span>
              </div>
            )}
          </div>
        )}

        {/* 2. Meeting Title Input */}
        <div style={{ marginTop: '1.5rem' }}>
          <label
            htmlFor="meeting-title"
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '0.5rem',
            }}
          >
            Meeting Title <span style={{ color: 'var(--status-error)' }}>*</span>
          </label>
          <input
            id="meeting-title"
            type="text"
            placeholder="e.g. Weekly Product Sync"
            value={title}
            onChange={handleTitleChange}
            disabled={isUploading}
            maxLength={200}
            required
            aria-invalid={!!titleError}
            aria-describedby={titleError ? 'title-error' : undefined}
            style={{
              width: '100%',
              padding: '0.625rem 0.875rem',
              fontSize: '0.925rem',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${titleError ? 'var(--status-error)' : 'var(--border)'}`,
              backgroundColor: isUploading ? 'var(--bg-canvas)' : 'var(--bg-surface)',
              color: 'var(--text-primary)',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'border-color 0.15s ease',
            }}
          />
          {titleError && (
            <p
              id="title-error"
              style={{
                fontSize: '0.825rem',
                color: 'var(--status-error)',
                marginTop: '0.35rem',
              }}
              role="alert"
            >
              {titleError}
            </p>
          )}
        </div>

        {/* 3. Real Upload Progress Bar */}
        {isUploading && <UploadProgress progress={uploadProgress} />}

        {/* 4. Server Error Banner */}
        {uploadState === 'error' && serverError && (
          <div
            role="alert"
            style={{
              marginTop: '1.25rem',
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--status-error-bg)',
              border: '1px solid var(--status-error-border)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
            }}
          >
            <AlertCircle size={20} style={{ color: 'var(--status-error)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--status-error-text)' }}>
                Upload Failed
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--status-error-text)', marginTop: '0.2rem' }}>
                {serverError}
              </p>
            </div>
          </div>
        )}

        {/* 5. Submit Button */}
        <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isUploading || !selectedFile}
            loading={isUploading}
            icon={<UploadCloud size={18} />}
            style={{ minWidth: '160px' }}
          >
            {isUploading ? 'Uploading...' : 'Upload Meeting'}
          </Button>
        </div>
      </form>
    </Card>
  );
};
