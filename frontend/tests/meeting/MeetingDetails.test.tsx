import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MeetingResults } from '../../src/components/meeting/MeetingResults';
import { mockCompletedMeeting, mockXssMeeting } from '../fixtures/meetingFixtures';

describe('Meeting Details & Results Rendering', () => {
  it('renders summary, key decisions, action items, and transcript for completed meeting', () => {
    render(<MeetingResults meeting={mockCompletedMeeting} />);

    expect(screen.getByText(/the team completed all sprint goals/i)).toBeInTheDocument();
    expect(screen.getByText('Launch on Friday')).toBeInTheDocument();
    expect(screen.getByText('Migrate database on Saturday')).toBeInTheDocument();

    expect(screen.getByText('Prepare release notes')).toBeInTheDocument();
    expect(screen.getByText(/Owner:\s*Alice/i)).toBeInTheDocument();
    expect(screen.getByText(/Deadline:\s*2026-09-18/i)).toBeInTheDocument();

    expect(screen.getByText(/Alice: We accomplished all sprint goals/i)).toBeInTheDocument();
  });

  it('displays fallback "Not specified" for missing action item owner and deadline', () => {
    render(<MeetingResults meeting={mockCompletedMeeting} />);

    expect(screen.getByText('Update deployment runbook')).toBeInTheDocument();

    const notSpecifiedElements = screen.getAllByText(/not specified/i);
    expect(notSpecifiedElements.length).toBeGreaterThanOrEqual(2);
  });

  it('renders adversarial XSS transcripts safely as plain text without HTML execution', () => {
    const { container } = render(<MeetingResults meeting={mockXssMeeting} />);

    const scripts = container.querySelectorAll('script');
    expect(scripts.length).toBe(0);

    expect(screen.getByText(/<script>alert\("xss"\)<\/script>/i)).toBeInTheDocument();
    expect(screen.getByText(/<script>evil\(\)<\/script>/i)).toBeInTheDocument();
  });
});
