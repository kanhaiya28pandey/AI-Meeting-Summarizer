import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import { UploadCard } from '../../src/components/common/UploadCard';
import { FileDropZone } from '../../src/components/common/FileDropZone';
import { api, ApiClientError } from '../../src/services/api';
import { mockCompletedMeeting } from '../fixtures/meetingFixtures';

describe('Upload Flow & Component Tests', () => {
  it('allows file selection and displays file details', async () => {
    const handleFileSelect = vi.fn();
    const { container } = render(<FileDropZone onFileSelect={handleFileSelect} />);

    const dropzone = screen.getByRole('button', { name: /upload meeting file/i });
    expect(dropzone).toBeInTheDocument();

    const file = new File(['dummy audio content'], 'team_sync.mp3', { type: 'audio/mpeg' });
    const input = container.querySelector('#meeting-file-input') as HTMLInputElement;
    expect(input).toBeInTheDocument();

    await userEvent.upload(input, file);
    expect(handleFileSelect).toHaveBeenCalledWith(file);
  });

  it('rejects unsupported extensions such as PDF or EXE in drop zone validation', async () => {
    const handleFileSelect = vi.fn();
    const handleError = vi.fn();
    const { container } = render(
      <FileDropZone onFileSelect={handleFileSelect} onError={handleError} />
    );

    const invalidFile = new File(['document content'], 'notes.pdf', { type: 'application/pdf' });
    const input = container.querySelector('#meeting-file-input') as HTMLInputElement;

    // fireEvent.change simulates selecting an unsupported file when "All Files" is chosen in picker
    fireEvent.change(input, { target: { files: [invalidFile] } });
    expect(handleFileSelect).not.toHaveBeenCalled();
    expect(handleError).toHaveBeenCalledWith(expect.stringMatching(/unsupported|invalid/i));
  });

  it('submits valid upload and prevents duplicate submission by disabling button', async () => {
    const user = userEvent.setup();
    const uploadSpy = vi.spyOn(api, 'uploadMeeting').mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockCompletedMeeting), 100))
    );

    const { container } = render(
      <MemoryRouter>
        <UploadCard />
      </MemoryRouter>
    );

    const file = new File(['dummy audio'], 'planning.mp3', { type: 'audio/mpeg' });
    const input = container.querySelector('#meeting-file-input') as HTMLInputElement;
    await user.upload(input, file);

    const titleInput = screen.getByLabelText(/meeting title/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Sprint 42 Planning');

    const submitBtn = screen.getByRole('button', { name: /upload meeting/i });
    expect(submitBtn).toBeEnabled();

    await user.click(submitBtn);
    expect(submitBtn).toBeDisabled();

    await user.click(submitBtn);
    expect(uploadSpy).toHaveBeenCalledTimes(1);

    uploadSpy.mockRestore();
  });

  it('displays user-friendly error message on upload failure', async () => {
    const user = userEvent.setup();
    const uploadSpy = vi.spyOn(api, 'uploadMeeting').mockRejectedValue(
      new ApiClientError('The file is too large. Maximum size is 100 MB.', 413)
    );

    const { container } = render(
      <MemoryRouter>
        <UploadCard />
      </MemoryRouter>
    );

    const file = new File(['dummy audio'], 'large.mp3', { type: 'audio/mpeg' });
    const input = container.querySelector('#meeting-file-input') as HTMLInputElement;
    await user.upload(input, file);

    const titleInput = screen.getByLabelText(/meeting title/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Large Meeting');

    const submitBtn = screen.getByRole('button', { name: /upload meeting/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/too large/i);
    });

    uploadSpy.mockRestore();
  });
});
