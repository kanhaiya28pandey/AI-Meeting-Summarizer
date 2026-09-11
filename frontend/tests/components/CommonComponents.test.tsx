import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { PageHeader } from '../../src/components/ui/PageHeader';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { LoadingState } from '../../src/components/ui/LoadingState';
import { ErrorState } from '../../src/components/ui/ErrorState';
import { Sidebar } from '../../src/components/layout/Sidebar';
import { Header } from '../../src/components/layout/Header';

describe('Common Components Suite', () => {
  it('renders Button variants, handles click, and respects disabled / loading states', () => {
    const handleClick = vi.fn();
    const { rerender } = render(
      <Button variant="primary" onClick={handleClick}>
        Submit
      </Button>
    );

    const btn = screen.getByRole('button', { name: /submit/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);

    // Disabled state
    rerender(
      <Button variant="primary" disabled onClick={handleClick}>
        Submit
      </Button>
    );
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);

    // Loading state
    rerender(
      <Button variant="primary" loading onClick={handleClick}>
        Submit
      </Button>
    );
    expect(btn).toBeDisabled();
  });

  it('renders Card container and children', () => {
    render(
      <Card>
        <p>Card body content</p>
      </Card>
    );
    expect(screen.getByText('Card body content')).toBeInTheDocument();
  });

  it('renders Badge with correct text and variant styles', () => {
    const { rerender } = render(<Badge variant="success">Completed</Badge>);
    expect(screen.getByText('Completed')).toBeInTheDocument();

    rerender(<Badge variant="danger">Failed</Badge>);
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('renders PageHeader with title and description', () => {
    render(
      <PageHeader
        title="Dashboard"
        description="Meeting overview"
      />
    );
    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByText('Meeting overview')).toBeInTheDocument();
  });

  it('renders EmptyState, LoadingState, and ErrorState', () => {
    const { rerender } = render(
      <EmptyState
        title="No Meetings"
        description="Upload your first recording to get started."
      />
    );
    expect(screen.getByText('No Meetings')).toBeInTheDocument();

    rerender(<LoadingState message="Fetching data..." />);
    expect(screen.getByText('Fetching data...')).toBeInTheDocument();

    rerender(
      <ErrorState
        title="Error Occurred"
        message="Failed to connect to backend."
      />
    );
    expect(screen.getByText('Error Occurred')).toBeInTheDocument();
    expect(screen.getByText('Failed to connect to backend.')).toBeInTheDocument();
  });

  it('renders Sidebar navigation links inside router', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Sidebar />
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /my meetings/i })).toBeInTheDocument();
  });

  it('renders Header with brand title and status', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    expect(screen.getByText(/ai meeting summarizer/i)).toBeInTheDocument();
  });
});
