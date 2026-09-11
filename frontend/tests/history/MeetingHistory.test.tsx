import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import { Meetings } from '../../src/pages/Meetings';
import { api } from '../../src/services/api';
import { mockCompletedMeeting, mockProcessingMeeting } from '../fixtures/meetingFixtures';

describe('Meeting History & Management UI', () => {
  it('renders list of meetings with metadata and handles delete confirmation modal', async () => {
    const user = userEvent.setup();
    const getSpy = vi
      .spyOn(api, 'getMeetings')
      .mockResolvedValue([mockCompletedMeeting, mockProcessingMeeting]);
    const deleteSpy = vi.spyOn(api, 'deleteMeeting').mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <Meetings />
      </MemoryRouter>
    );

    // Verify meetings loaded
    await waitFor(() => {
      expect(screen.getByText('Sprint Retrospective')).toBeInTheDocument();
      expect(screen.getByText('Quarterly Review')).toBeInTheDocument();
    });

    // Find delete button for Sprint Retrospective
    const deleteBtn = screen.getByRole('button', { name: /delete meeting sprint retrospective/i });
    expect(deleteBtn).toBeInTheDocument();

    // Click delete to trigger confirmation dialog
    await user.click(deleteBtn);

    // Modal dialog is displayed
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/are you sure you want to delete "sprint retrospective"/i)).toBeInTheDocument();

    // Click Cancel
    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelBtn);

    // Modal closed, delete not called
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(deleteSpy).not.toHaveBeenCalled();

    // Open modal again and confirm delete
    await user.click(deleteBtn);
    const confirmBtn = screen.getByRole('button', { name: /^delete meeting$/i });
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledWith(mockCompletedMeeting.id);
    });

    getSpy.mockRestore();
    deleteSpy.mockRestore();
  });
});
