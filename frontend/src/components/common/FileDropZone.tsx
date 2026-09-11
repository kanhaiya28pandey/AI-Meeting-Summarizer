import { useState, useRef, type FC, type DragEvent, type ChangeEvent, type KeyboardEvent } from 'react';
import { UploadCloud, Music } from 'lucide-react';
import { validateAudioFile } from '../../utils/fileValidation';

export interface FileDropZoneProps {
  onFileSelect: (file: File) => void;
  onError: (errorMessage: string) => void;
  disabled?: boolean;
}

export const FileDropZone: FC<FileDropZoneProps> = ({
  onFileSelect,
  onError,
  disabled = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounter = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;

    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;

    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const processFile = (file: File) => {
    const validation = validateAudioFile(file);
    if (!validation.valid) {
      onError(validation.error || 'Invalid audio file.');
      return;
    }
    onFileSelect(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    dragCounter.current = 0;

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    if (files.length > 1) {
      onError('Please upload one meeting file at a time.');
      return;
    }

    processFile(files[0]);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    processFile(files[0]);
    // Reset file input value so selecting the same file again triggers change event
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Upload meeting file. Drag and drop your audio or video here or press Enter to browse files."
      aria-disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${isDragOver ? 'var(--primary)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        backgroundColor: isDragOver ? 'var(--primary-light)' : 'var(--bg-canvas)',
        padding: '2.5rem 1.5rem',
        textAlign: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease-in-out',
        outline: 'none',
      }}
    >
      <input
        ref={fileInputRef}
        id="meeting-file-input"
        type="file"
        accept=".mp3,.wav,.m4a,.mp4,.mov,audio/mpeg,audio/wav,audio/x-wav,audio/mp4,video/mp4,video/quicktime"
        style={{ display: 'none' }}
        onChange={handleInputChange}
        disabled={disabled}
        aria-hidden="true"
      />

      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: isDragOver ? 'var(--bg-surface)' : 'var(--primary-light)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem',
          transition: 'all 0.2s ease',
        }}
      >
        <UploadCloud size={28} />
      </div>

      <h4
        style={{
          fontSize: '1.05rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '0.25rem',
        }}
      >
        {isDragOver ? 'Drop your meeting file here' : 'Upload your meeting'}
      </h4>

      <p
        style={{
          fontSize: '0.9rem',
          color: 'var(--text-secondary)',
          marginBottom: '1rem',
        }}
      >
        Drag &amp; drop your audio or video here or <span style={{ color: 'var(--primary)', fontWeight: 600 }}>browse files</span>
      </p>

      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.375rem',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          backgroundColor: 'var(--bg-surface)',
          padding: '0.3rem 0.75rem',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border)',
        }}
      >
        <Music size={13} />
        <span>MP3 • WAV • M4A • MP4 • MOV • Max 100 MB</span>
      </div>
    </div>
  );
};
