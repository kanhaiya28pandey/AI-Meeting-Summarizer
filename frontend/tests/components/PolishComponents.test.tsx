import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Skeleton } from '../../src/components/ui/Skeleton';
import { StatusBadge } from '../../src/components/ui/StatusBadge';
import { ToastProvider, useToast } from '../../src/components/ui';
import { Button } from '../../src/components/ui/Button';

const TestToastConsumer = () => {
  const { success, error, info } = useToast();
  return (
    <div>
      <button onClick={() => success('Meeting saved successfully')}>Trigger Success</button>
      <button onClick={() => error('Deletion failed')}>Trigger Error</button>
      <button onClick={() => info('Information note')}>Trigger Info</button>
    </div>
  );
};

describe('Phase 18 Polished Components Suite', () => {
  it('renders Skeleton with specified dimensions and style', () => {
    const { container } = render(<Skeleton width="120px" height="24px" borderRadius="8px" />);
    const skeletonEl = container.querySelector('.skeleton');
    expect(skeletonEl).toBeInTheDocument();
    expect(skeletonEl).toHaveStyle({ width: '120px', height: '24px', borderRadius: '8px' });
  });

  it('renders StatusBadge with friendly labels for all backend statuses', () => {
    const { rerender } = render(<StatusBadge status="UPLOADED" />);
    expect(screen.getByText('Uploading')).toBeInTheDocument();

    rerender(<StatusBadge status="TRANSCRIBING" />);
    expect(screen.getByText('Transcribing')).toBeInTheDocument();

    rerender(<StatusBadge status="ANALYZING" />);
    expect(screen.getByText('Analyzing')).toBeInTheDocument();

    rerender(<StatusBadge status="SAVING" />);
    expect(screen.getByText('Saving')).toBeInTheDocument();

    rerender(<StatusBadge status="COMPLETED" />);
    expect(screen.getByText('Ready')).toBeInTheDocument();

    rerender(<StatusBadge status="FAILED" />);
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('renders Button with loadingText when loading', () => {
    render(
      <Button loading loadingText="Deleting...">
        Delete
      </Button>
    );
    expect(screen.getByRole('button')).toHaveTextContent('Deleting...');
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows and dismisses toast notifications via ToastProvider', () => {
    render(
      <ToastProvider>
        <TestToastConsumer />
      </ToastProvider>
    );

    // Trigger success toast
    fireEvent.click(screen.getByText('Trigger Success'));
    expect(screen.getByText('Meeting saved successfully')).toBeInTheDocument();

    // Dismiss manually
    const dismissBtn = screen.getByRole('button', { name: /dismiss notification/i });
    expect(dismissBtn).toBeInTheDocument();
    fireEvent.click(dismissBtn);
    expect(screen.queryByText('Meeting saved successfully')).not.toBeInTheDocument();

    // Trigger error toast
    fireEvent.click(screen.getByText('Trigger Error'));
    expect(screen.getByText('Deletion failed')).toBeInTheDocument();
  });
});
